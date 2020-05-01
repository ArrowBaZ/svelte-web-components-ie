# Component builder

## Install dev environment

```
npm i
```

## Run local dev

```
npm run serve
```

Go to localhost:8080

## Build components

```
npm run build
```

# Start building you component

In `App.svelte` add you components import and tag

```
<script>
	import './cta/index.svelte'
</script>

<n-cta
        tracking="`Hero CTA`"
        link="./order"
        look="primary"
        size="4">Discover more</n-cta>
```

# Components

## Svelte components
### Variables
You cannot set an array as attributes. If it's an array it means it's a child component, like Carousel, Carousel-item.
Declare your variables:

```
<script>
export let title
</script>
``` 

### Declare the tag

```
<svelte:options tag="n-hero-cta"/>
``` 

## Schema

You need to provide 3 properties read by the page builder:
- `title` is the public title saw by users 
- `tag` tag include by the page builder it will be convert into `<tag></tag>`
- `folder` it's the folder where the component is located after the root 

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "title": "USP List (Unique Selling Points)",
  "tag": "n-usp",
  "folder": "usp",
  "properties": {
    "title": {
      "type": "string",
      "title": "Section title",
      "default": "SHOP example.org AND ENJOY"
    },
```

## Build component

Add you component in `./rollup.config.js` in `components` constant.

## Publish components

Add you component in `/src/`. It's the list of available components use by the page builder.

# Add you component in Browser and IE Polyfill

Change the path of you file `cta/index.es.min.js` and `cta/index.legacy.min.js` in `script.src`

```
<script>if (!window.Promise || ![].includes || !Object.assign || !window.Map || !window.fetch) {var polyfill = document.createElement('script');polyfill.src = 'https://polyfill.io/v3/polyfill.min.js?callback=fill%26features%3DArray.prototype.includes%252CPromise%252CMap%252CArray.from%252CString.prototype.startsWith%252CObject.assign%252CArray.prototype.fill';document.head.appendChild(polyfill);var webcomponentsjs = document.createElement('script');webcomponentsjs.src = 'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.4.3/webcomponents-bundle.js';document.head.appendChild(webcomponentsjs);}if (typeof HTMLElement === 'object') {var customElement = document.createElement('script');customElement.src = 'https://unpkg.com/custom-elements-es5-adapter@1.0.0/custom-elements-es5-adapter.js';customElement.crossorigin = 'anonymous';document.head.appendChild(customElement);}</script>
<n-cta
        tracking="`Hero CTA`"
        link="./order"
        look="primary"
        size="4">Discover more</n-cta>
<script src="cta/index.es.min.js" type="module"></script>
<script>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>
<script src="cta/index.legacy.min.js" type="nomodule"></script>
```
