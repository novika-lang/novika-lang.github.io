<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { effectSource, filteredWordIndexSet, wordSource } from "./storage";

  import _ from "lodash";
  import chroma from "chroma-js";
  import randomColor from "randomcolor";
  import elementResizeDetectorMaker from "element-resize-detector";
  import ForceGraph, {
    type ForceGraphInstance,
    type LinkObject,
    type NodeObject,
  } from "force-graph";
  import tippy, { type Instance as TippyInstance } from "tippy.js";
  import "tippy.js/animations/scale.css";
  import WordTip from "./WordTip.svelte";
  import { wordURI } from "./util";

  interface WordNode extends NodeObject {
    wordIndex: number;
    wordName: string;
    group: string;
    visible: boolean;
    baseColor: any;
    baseRingColor: any;
    bodyColorHex: string;
    focusRingColorHex: string;
    connections: number;
  }

  /**
   * Index of the word that is highlighted on the graph.
   */
  export let focusedWordIndex: number | undefined;

  let hoveredWordIndex: number | undefined;
  let hoveredWordUrl: string | undefined;

  let tipContainer: HTMLElement;
  let tipTemplate: HTMLElement;
  let tippyInstance: TippyInstance;

  let graph: HTMLElement;
  let graphWidth: number;
  let graphHeight: number;

  let G: ForceGraphInstance;

  let nodes: WordNode[] = [];
  let links: LinkObject[] = [];

  const nameToNode: Record<string, WordNode> = {};
  const nameToNconns: Record<string, number> = {};

  $: if (G !== undefined && focusedWordIndex !== undefined)
    bringFocusedIndexToView();

  const NODE_RADIUS = 3;

  let maxNconns = 0;
  let zoomK = 0;

  let mouseOverNode = false;

  /**
   * Adds a link between source and target on the graph.
   */
  function addGraphLink(sourceName: string, targetName: string) {
    const nconns = sourceName in nameToNconns ? nameToNconns[sourceName] : 0;

    nameToNconns[sourceName] = nconns + 1;
    maxNconns = Math.max(maxNconns, nconns + 1);

    links.push({ source: sourceName, target: targetName });
  }

  /**
   * Adds a node (a member of `group`) with the given name
   * to the graph.
   */
  function addGraphNode(wordIndex: number, wordName: string, group: string) {
    const seedColor = randomColor({ seed: wordIndex });

    const baseColor = chroma(seedColor);
    const baseRingColor = baseColor.brighten(2);

    const node = {
      wordName,
      wordIndex,
      group,
      visible: true,
      baseColor,
      baseRingColor,
      bodyColorHex: baseColor.hex(), // will be populated later
      focusRingColorHex: baseRingColor.hex(), // will be populated later
      connections: 0,
    };

    nameToNode[wordName] = node;

    nodes.push(node);
  }

  // When filtered word indices change we should recompute node colors.
  $: {
    const filteredWordIndices = $filteredWordIndexSet;
    for (const node of nodes) {
      node.visible = filteredWordIndices.has(node.wordIndex);
      node.bodyColorHex = node.baseColor
        .alpha(node.visible ? 1 : 0.2)
        .desaturate()
        .hex();
      node.focusRingColorHex = node.baseRingColor
        .darken(node.visible ? 0 : 4)
        .hex();
    }
  }

  onMount(() => {
    const wordToGroup: Record<string, string> = {};
    const wordsInGroup: Record<string, string[]> = {};

    // Populate the graph with nodes, gather some info for linking.
    for (let wordIndex = 0; wordIndex < wordSource.length; wordIndex++) {
      const { name } = wordSource[wordIndex];
      const index = name.indexOf(":");

      let group = name;
      if (!(index === -1 || index === 0 || index === name.length - 1)) {
        group = name.substring(0, index);

        wordToGroup[name] = group;

        if (group in wordsInGroup) {
          wordsInGroup[group].push(name);
        } else {
          wordsInGroup[group] = [name];
        }
      }

      addGraphNode(wordIndex, name, group);
    }

    // Populate the graph with links.
    for (let wordIndex = 0; wordIndex < wordSource.length; wordIndex++) {
      const word = wordSource[wordIndex];
      const wordEffectRefs = word.erefs.map(([index, _owner]) => index);
      const effectNeighborIds: number[] = _.uniq(
        wordEffectRefs
          .flatMap((index) => effectSource[index].words)
          .concat(word.outbound)
      );

      // Connect words that have the same effects, avoid self-connections.
      for (const neighborId of effectNeighborIds)
        if (neighborId !== wordIndex)
          addGraphLink(word.name, wordSource[neighborId].name);

      const group = wordToGroup[word.name];
      if (group === undefined) continue;

      // Connect words belonging to the same group, avoid self-connections.
      for (const neighborName of wordsInGroup[group])
        if (neighborName !== word.name) addGraphLink(word.name, neighborName);
    }

    // Make sure there are no repeating nodes/links.
    nodes = _.uniqBy(nodes, (node: WordNode) => node.wordName);
    links = _.uniqBy(
      links,
      (link: LinkObject) => `${link.source}${link.target}`
    );
    links = _.uniqBy(
      links,
      (link: LinkObject) => `${link.target}${link.source}`
    );

    // Create and configure the graph.
    G = ForceGraph()(graph)
      .width(graphWidth)
      .height(graphHeight)
      .graphData({ nodes, links })
      .nodeId("wordName")
      .cooldownTime(0)
      .warmupTicks(120)
      .enableNodeDrag(false)
      .nodeColor((node) => (node as WordNode).bodyColorHex)
      .nodeRelSize(NODE_RADIUS)
      .maxZoom(10)
      .linkColor(() => "red")
      .linkCurvature(0.4)
      .linkVisibility(false)
      .d3VelocityDecay(0.3)
      .autoPauseRedraw(false)
      .onNodeHover((nodeArg) => {
        const node = nodeArg as WordNode | null;

        if (node === null) {
          mouseOverNode = false;
          noTooltip();
          return;
        }

        if (node.x === undefined || node.y === undefined) return;

        const screenCoords = G.graph2ScreenCoords(node.x, node.y);
        const referenceClientRect = {
          width: NODE_RADIUS * 2,
          height: NODE_RADIUS * 2,
          left: screenCoords.x + graph.offsetLeft,
          right: screenCoords.x + NODE_RADIUS * 2 + graph.offsetLeft,
          top: screenCoords.y + graph.offsetTop,
          bottom: screenCoords.y + NODE_RADIUS * 2 + graph.offsetTop,
        };

        mouseOverNode = true;
        hoveredWordIndex = node.wordIndex;
        hoveredWordUrl = wordURI(node.wordName);

        tippyInstance.setProps({
          getReferenceClientRect: () => referenceClientRect,
        });
        tippyInstance.show();
      })
      .onNodeClick((node) => {
        goto(wordURI(node.wordName));

        mouseOverNode = true;
      })
      .onBackgroundClick(() => {
        goto(`/docs`);

        mouseOverNode = false;
      })
      .onZoom((tf) => (zoomK = tf.k))
      .onZoomEnd((tf) => (zoomK = tf.k))
      .nodeCanvasObjectMode(() => "before")
      .nodeCanvasObject((nodeArg, ctx, globalScale) => {
        const node = nodeArg as WordNode;

        // When in Rome do as the Romans do, I suppose...
        if (graph === null || node.x === undefined || node.y === undefined)
          return;

        const opacity = zoomK / 10; //  map [0; 10] => [0; 1]

        if (opacity > 0.3) {
          // Build a visible rect in order to see whether the label is
          // going to be visible. If not bail out, no point in straining
          // the poor JavaScript engine even more.

          const topLeft = G.screen2GraphCoords(
            graph.offsetLeft,
            graph.offsetTop
          );

          const bottomRight = {
            x: topLeft.x + graph.offsetWidth,
            y: topLeft.y + graph.offsetHeight,
          };

          const textLeft = node.x + NODE_RADIUS * 1.8;
          const textTop = node.y;

          const visible =
            topLeft.x < textLeft &&
            textLeft < bottomRight.x &&
            topLeft.y < textTop &&
            textTop < bottomRight.y;

          if (visible) {
            const label = node.wordName;
            const fontSize = 14 / globalScale;
            ctx.font = `${fontSize}px Iosevka Curly`;

            ctx.textBaseline = "middle";
            ctx.fillStyle = node.baseRingColor.alpha(opacity);
            ctx.fillText(label, textLeft, textTop);
          }
        }

        // Add ring just for the focused node
        if (focusedWordIndex === node.wordIndex) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, NODE_RADIUS * 1.5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.focusRingColorHex;
          ctx.fill();
        }
      });

    G.d3Force("link").distance((link: LinkObject) => {
      const x = nameToNconns[link.source.wordName] / maxNconns;
      return 100 * (4 * x * (1 - x));
    });

    const resizeDetector = elementResizeDetectorMaker({
      // @ts-ignore
      strategy: "scroll",
    });

    // @ts-ignore
    resizeDetector.listenTo(graph, (element: HTMLElement) => {
      G.width(element.offsetWidth);
      G.height(element.offsetHeight);
    });

    tippyInstance = tippy(tipContainer, {
      content: tipTemplate,
      placement: "bottom-start",
      interactive: true,
      trigger: "manual",
      allowHTML: true,
      theme: "word-tip",
      animation: "shift-away",
    });

    const timeoutId = setTimeout(bringFocusedIndexToView, 1000);

    return () => {
      clearTimeout(timeoutId);
      resizeDetector.uninstall(graph);
      tippyInstance.destroy();
    };
  });

  function noTooltip() {
    tippyInstance.hide();
  }

  function bringFocusedIndexToView() {
    if (focusedWordIndex === undefined) return;
    const focusedNode = nameToNode[wordSource[focusedWordIndex].name];
    G.centerAt(focusedNode.x, focusedNode.y, 500);
    G.zoom(10, 1000);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="w-full h-full" bind:this={tipContainer}>
  <div
    class="graph bg-zinc-950 w-full h-full"
    bind:this={graph}
    bind:offsetWidth={graphWidth}
    bind:offsetHeight={graphHeight}
    class:cursor-pointer={mouseOverNode}
  />
  <a
    bind:this={tipTemplate}
    class="z-50 cursor-pointer"
    href={hoveredWordUrl}
    on:click={noTooltip}
  >
    {#if hoveredWordIndex !== undefined}
      <WordTip wordIndex={hoveredWordIndex} />
    {/if}
  </a>
</div>

<style lang="postcss">
  :global(.graph-tooltip) {
    display: none;
  }

  .graph:not(.cursor-pointer) :global(canvas.clickable) {
    cursor: default !important;
  }

  :global(.tippy-box[data-theme="word-tip"]) {
    @apply font-main bg-zinc-700 rounded overflow-hidden;
  }

  :global(.tippy-box[data-theme="word-tip"] > .tippy-content) {
    @apply p-0;
  }

  :global(.tippy-box[data-theme="word-tip"] > .tippy-arrow) {
    @apply text-zinc-700 cursor-pointer;
  }
</style>
