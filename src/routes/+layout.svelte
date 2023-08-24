<script>
  import "../app.postcss";
  import "remixicon/fonts/remixicon.css";

  import "@fontsource/barlow/latin-400.css";
  import "@fontsource/barlow/latin-500.css";
  import "@fontsource/barlow/latin-600.css";
  import "@fontsource/barlow/latin-800.css";
  import "@fontsource/barlow/latin-400-italic.css";
  import "@fontsource/barlow/latin-500-italic.css";
  import "@fontsource/barlow/latin-600-italic.css";
  import "@fontsource/barlow/latin-800-italic.css";

  import "@fontsource/iosevka-curly/400.css";
  import "@fontsource/iosevka-curly/500.css";
  import "@fontsource/iosevka-curly/600.css";
  import "@fontsource/iosevka-curly/800.css";
  import "@fontsource/iosevka-curly/400-italic.css";
  import "@fontsource/iosevka-curly/500-italic.css";
  import "@fontsource/iosevka-curly/600-italic.css";
  import "@fontsource/iosevka-curly/800-italic.css";
  import DocNav from "$lib/DocNav.svelte";
</script>

<svelte:head>
  <title>Novika - A moldable, concise, expressive programming language</title>
</svelte:head>

<div
  class="bg-zinc-950 text-zinc-300 font-main antialiased w-screen h-screen flex flex-col"
>
  <header
    class="bg-zinc-900 px-2 py-0.5 sticky top-0 shadow z-50 border-b border-zinc-800"
  >
    <div class="grid grid-cols-2 justify-between w-full">
      <a class="flex text-xs font-medium gap-2 items-center" href="/">
        <svg
          class="w-4"
          viewBox="0 0 448 449"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_202_3)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 24.5C0 10.969 10.969 0 24.5 0C38.031 0 49 10.969 49 24.5V78.7841L196 188.846V70.3429H252V188.556L399 78.4931V24.5C399 10.969 409.969 0 423.5 0C437.031 0 448 10.969 448 24.5V423.5C448 437.031 437.031 448 423.5 448C409.969 448 399 437.031 399 423.5V373.206L252 262.956V378.343H196V262.664L49 372.914V423.5C49 437.031 38.031 448 24.5 448C10.969 448 0 437.031 0 423.5V24.5ZM49 318.949L173.27 225.747L49 132.703V318.949ZM399 132.412V319.241L274.341 225.747L399 132.412Z"
              fill="url(#paint0_linear_202_3)"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_202_3"
              x="0"
              y="0"
              width="448"
              height="449"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.230139 0 0 0 0 0.368222 0 0 0 0 0.575347 0 0 0 0.36 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_202_3"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_202_3"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_202_3"
              x1="132.009"
              y1="0"
              x2="132.009"
              y2="448"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#4472B0" />
              <stop offset="1" stop-color="#6559F4" />
            </linearGradient>
          </defs>
        </svg>
      </a>
      <div class="place-self-end">
        <DocNav />
      </div>
    </div>
  </header>

  <slot />
</div>
