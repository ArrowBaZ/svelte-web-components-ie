<style>
    /*RESET*/
    *, *:before, *:after {
        box-sizing: inherit;
    }

    a {
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        font-weight: inherit;
        font-style: inherit;
        font-size: 100%;
        font-family: inherit;
        vertical-align: baseline;
        -webkit-appearance: none;
    }

    /*RESET*/
    .c-Cta *,
    .c-Cta:before,
    .c-Cta:after,
    .c-Cta *:before,
    .c-Cta *:after,
    .c-Cta {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .c-Cta {
        border: 0;
        text-align: left;
        color: inherit;
        text-decoration: none;
        transition: .25s ease;
        background-color: transparent;
        cursor: pointer;
        font: inherit;
        margin: 0;
        overflow: visible;
        text-transform: none;
        vertical-align: inherit;
        outline: none;
        padding: 0;
        line-height: normal;
    }

    .c-Cta::-moz-focus-inner {
        border-style: none;
        padding: 0
    }

    .c-Cta:-moz-focusring {
        outline: 1px dotted ButtonText
    }

    .c-Cta:focus {
        outline: none
    }

    .c-Cta:active, .c-Cta:hover {
        outline-width: 0
    }

    .c-Cta:hover .c-Cta__text,
    .c-Cta:focus .c-Cta__text {
        text-decoration: none;
    }

    /* CTA */
    .c-Cta__text__xl,
    .c-Cta__text__l,
    .c-Cta__text__m,
    .c-Cta__text__s,
    .c-Cta__text__xs {
        font-family: Lucas, Helvetica, Arial, sans-serif;
    }

    .c-Cta__text__xl {
        font-size: 24px;
        letter-spacing: 2px;
        font-weight: 300
    }

    .c-Cta__text__l {
        font-size: 18px;
        letter-spacing: 1px;
        font-weight: 300
    }

    .c-Cta__text__m {
        font-size: 16px;
        letter-spacing: 1px;
        font-weight: 400
    }

    .c-Cta__text__s {
        font-size: 14px;
        letter-spacing: 1px;
        font-weight: 800
    }


    .c-Cta__text__xs {
        font-size: 12px;
        letter-spacing: 0;
        font-weight: 400
    }

    .c-Cta {
        display: flex;
        flex: 1 0 100%;
        padding: 12px 24px;
        border-radius: .25em;
        justify-content: center;
        align-items: baseline;
        margin-top: 24px;
    }

    .c-Cta__text__icon {
        margin-left: .25em;
        transform: translateY(1px);
    }

    .c-Cta--primary,
    .c-Cta--subtle {
        min-width: 200px;
    }

    .c-Cta--primary {
        text-transform: uppercase;
        border: 1px solid #877352;
        background-color: #877352;
    }

    .c-Cta--primary .c-Cta__text {
        color: #FFFFFF !important;
    }

    .c-Cta--subtle {
        border: 1px solid #000000;
    }

    .c-Cta--subtle .c-Cta__text,
    .c-Cta--primary .c-Cta__text {
        text-transform: uppercase;
    }

    .c-Cta--primary:focus:not(:disabled),
    .c-Cta--primary:hover:not(:disabled) {
        box-shadow: 0 12px 24px 0 rgba(0, 0, 0, .5);
    }

    .c-Cta--subtle:focus:not(:disabled),
    .c-Cta--subtle:hover:not(:disabled) {
        background-color: #000;
    }

    .c-Cta--subtle:focus:not(:disabled) .c-Cta__text,
    .c-Cta--subtle:hover:not(:disabled) .c-Cta__text {
        color: #fff;
    }

    @media screen and (max-width: 768px) {
        .c-Cta {
            margin-top: 16px;
        }
    }

    @media screen and (max-width: 767px) {
        .c-Cta--subtle {
            min-width: auto;
        }
    }

    .c-Cta--link {
        border-radius: 0;
        padding: 0 0 2px 0;
        margin-top: 8px;
        border-bottom: 1px solid transparent;
    }

    .c-Cta--link:not(.c-Cta--gold) .c-Cta__text.c-Cta__text__s {
        font-weight: inherit;
    }

    .c-Cta--link:not(.c-Cta--gold):hover {
        border-color: white;
    }

    .c-Cta--gold:hover {
        border-color: #877352;
    }

    .c-Cta--inline {
        display: inline-flex;
    }

    :host-context(.c-Zone--light) .c-Cta__text {
        color: #000;
    }

    :host-context(.c-Zone--light) .c-Cta__text__icon path {
        fill: #000;
    }

    :host-context(.c-Zone--dark) .c-Cta--subtle {
        border-color: #FFF;
    }

    :host-context(.c-Zone--dark) .c-Cta__text {
        color: #FFF;
    }

    :host-context(.c-Zone--dark) .c-Cta__text__icon path {
        fill: #FFF;
    }

    .c-Cta--gold .c-Cta__text {
        font-weight: 600;
    }

    .c-Cta--gold .c-Cta__text,
    :host-context(.c-Zone--dark) .c-Cta--gold .c-Cta__text,
    :host-context(.c-Zone--light) .c-Cta--gold .c-Cta__text {
        color: #877352;
    }

    .c-Cta--gold .c-Cta__text .c-Cta__text__icon path,
    :host-context(.c-Zone--dark) .c-Cta--gold .c-Cta__text__icon path,
    :host-context(.c-Zone--light) .c-Cta--gold .c-Cta__text__icon path {
        fill: #877352;
    }
</style>
<a on:click={handleClick} href="{link}" class="{getStyleCta({look})}">
    <span class="c-Cta__text {level}">
      <slot></slot>
    </span>
    {#if look === constants.CTA_LINK || look === constants.CTA_LINK_GOLD}
        <svg class="c-Cta__text__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="10" height="10">
            <path d="M414.4 342.624L437.024 320 256 138.976l-45.248 45.248L346.496 320 210.752 455.776 256 501.024l158.4-158.4z"/>
        </svg>
    {/if}
</a>
<svelte:window bind:innerWidth={innerWidth}/>
<svelte:options tag="n-cta"/>
<script>
    export let tracking
    export let size
    export let size_mobile
    export let look
    export let content
    export let link

    import * as constants from '../constants'

    const TXT_CLASS = 'c-Cta__text__'
    const TXT_SIZES = ['xl', 'l', 'm', 's', 'xs']

    let isMobile = false
    let innerWidth
    $: isMobile = innerWidth < constants.BREAKPOINT_S
    $: size_mobile = size_mobile ? size_mobile : size
    $: currentSize = isMobile ? size_mobile : size
    $: TXT_SIZE = TXT_SIZES[currentSize - 1]
    $: level = `${TXT_CLASS}${TXT_SIZE}`

    const getStyleCta = ({ look }) => {
        if (look === constants.CTA_SUBTLE) {
            return `c-Cta c-Cta--subtle c-Cta--inline`
        }

        if (look === constants.CTA_LINK) {
            return `c-Cta c-Cta--link c-Cta--inline c-Cta--light`
        }

        if (look === constants.CTA_LINK_GOLD) {
            return `c-Cta c-Cta--link c-Cta--inline c-Cta--gold c-Cta--inline c-Cta--light`
        }

        return `c-Cta c-Cta--primary c-Cta--inline`
    }

    const handleClick = () => {
        window.gtmDataObject = window.gtmDataObject || []
        window.gtmDataObject.push({
            event: 'customEvent',
            eventRaisedBy: 'FreeHTML',
            eventCategory: 'User Engagement',
            eventAction: 'Click',
            eventLabel: tracking
        })
    }
</script>
