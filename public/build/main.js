
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
'use strict';

function noop() { }
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = value;
    }
    else {
        attr(node, prop, value);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    };
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}

const BREAKPOINT_XL = 1920;
const BREAKPOINT_L = 996;
const BREAKPOINT_S = 750;

const CTA_PRIMARY = 'primary';
const CTA_SUBTLE = 'subtle';
const CTA_LINK = 'link';
const CTA_LINK_GOLD = 'link-gold';

var constants = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BREAKPOINT_XL: BREAKPOINT_XL,
    BREAKPOINT_L: BREAKPOINT_L,
    BREAKPOINT_S: BREAKPOINT_S,
    CTA_PRIMARY: CTA_PRIMARY,
    CTA_SUBTLE: CTA_SUBTLE,
    CTA_LINK: CTA_LINK,
    CTA_LINK_GOLD: CTA_LINK_GOLD
});

/* src/cta/index.svelte generated by Svelte v3.21.0 */

const { window: window_1 } = globals;
const file = "src/cta/index.svelte";

// (241:4) {#if look === constants.CTA_LINK || look === constants.CTA_LINK_GOLD}
function create_if_block(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr_dev(path, "d", "M414.4 342.624L437.024 320 256 138.976l-45.248 45.248L346.496 320 210.752 455.776 256 501.024l158.4-158.4z");
			add_location(path, file, 242, 12, 5171);
			attr_dev(svg, "class", "c-Cta__text__icon");
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", "0 0 640 640");
			attr_dev(svg, "width", "10");
			attr_dev(svg, "height", "10");
			add_location(svg, file, 241, 8, 5047);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(241:4) {#if look === constants.CTA_LINK || look === constants.CTA_LINK_GOLD}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let a;
	let span;
	let slot;
	let span_class_value;
	let t;
	let a_class_value;
	let dispose;
	add_render_callback(/*onwindowresize*/ ctx[14]);
	let if_block = (/*look*/ ctx[0] === CTA_LINK || /*look*/ ctx[0] === CTA_LINK_GOLD) && create_if_block(ctx);

	const block = {
		c: function create() {
			a = element("a");
			span = element("span");
			slot = element("slot");
			t = space();
			if (if_block) if_block.c();
			this.c = noop;
			add_location(slot, file, 238, 6, 4939);
			attr_dev(span, "class", span_class_value = "c-Cta__text " + /*level*/ ctx[3]);
			add_location(span, file, 237, 4, 4898);
			attr_dev(a, "href", /*link*/ ctx[1]);
			attr_dev(a, "class", a_class_value = /*getStyleCta*/ ctx[4]({ look: /*look*/ ctx[0] }));
			add_location(a, file, 236, 0, 4823);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor, remount) {
			insert_dev(target, a, anchor);
			append_dev(a, span);
			append_dev(span, slot);
			append_dev(a, t);
			if (if_block) if_block.m(a, null);
			if (remount) run_all(dispose);

			dispose = [
				listen_dev(window_1, "resize", /*onwindowresize*/ ctx[14]),
				listen_dev(a, "click", /*handleClick*/ ctx[5], false, false, false)
			];
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*level*/ 8 && span_class_value !== (span_class_value = "c-Cta__text " + /*level*/ ctx[3])) {
				attr_dev(span, "class", span_class_value);
			}

			if (/*look*/ ctx[0] === CTA_LINK || /*look*/ ctx[0] === CTA_LINK_GOLD) {
				if (if_block) ; else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(a, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*link*/ 2) {
				attr_dev(a, "href", /*link*/ ctx[1]);
			}

			if (dirty & /*look*/ 1 && a_class_value !== (a_class_value = /*getStyleCta*/ ctx[4]({ look: /*look*/ ctx[0] }))) {
				attr_dev(a, "class", a_class_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
			if (if_block) if_block.d();
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const TXT_CLASS = "c-Cta__text__";

function instance($$self, $$props, $$invalidate) {
	let { tracking } = $$props;
	let { size } = $$props;
	let { size_mobile } = $$props;
	let { look } = $$props;
	let { content } = $$props;
	let { link } = $$props;
	const TXT_SIZES = ["xl", "l", "m", "s", "xs"];
	let isMobile = false;
	let innerWidth;

	const getStyleCta = ({ look }) => {
		if (look === CTA_SUBTLE) {
			return `c-Cta c-Cta--subtle c-Cta--inline`;
		}

		if (look === CTA_LINK) {
			return `c-Cta c-Cta--link c-Cta--inline c-Cta--light`;
		}

		if (look === CTA_LINK_GOLD) {
			return `c-Cta c-Cta--link c-Cta--inline c-Cta--gold c-Cta--inline c-Cta--light`;
		}

		return `c-Cta c-Cta--primary c-Cta--inline`;
	};

	const handleClick = () => {
		window.gtmDataObject = window.gtmDataObject || [];

		window.gtmDataObject.push({
			event: "customEvent",
			eventRaisedBy: "FreeHTML",
			eventCategory: "User Engagement",
			eventAction: "Click",
			eventLabel: tracking
		});
	};

	const writable_props = ["tracking", "size", "size_mobile", "look", "content", "link"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<n-cta> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("n-cta", $$slots, []);

	function onwindowresize() {
		$$invalidate(2, innerWidth = window_1.innerWidth);
	}

	$$self.$set = $$props => {
		if ("tracking" in $$props) $$invalidate(7, tracking = $$props.tracking);
		if ("size" in $$props) $$invalidate(8, size = $$props.size);
		if ("size_mobile" in $$props) $$invalidate(6, size_mobile = $$props.size_mobile);
		if ("look" in $$props) $$invalidate(0, look = $$props.look);
		if ("content" in $$props) $$invalidate(9, content = $$props.content);
		if ("link" in $$props) $$invalidate(1, link = $$props.link);
	};

	$$self.$capture_state = () => ({
		tracking,
		size,
		size_mobile,
		look,
		content,
		link,
		constants,
		TXT_CLASS,
		TXT_SIZES,
		isMobile,
		innerWidth,
		getStyleCta,
		handleClick,
		currentSize,
		TXT_SIZE,
		level
	});

	$$self.$inject_state = $$props => {
		if ("tracking" in $$props) $$invalidate(7, tracking = $$props.tracking);
		if ("size" in $$props) $$invalidate(8, size = $$props.size);
		if ("size_mobile" in $$props) $$invalidate(6, size_mobile = $$props.size_mobile);
		if ("look" in $$props) $$invalidate(0, look = $$props.look);
		if ("content" in $$props) $$invalidate(9, content = $$props.content);
		if ("link" in $$props) $$invalidate(1, link = $$props.link);
		if ("isMobile" in $$props) $$invalidate(10, isMobile = $$props.isMobile);
		if ("innerWidth" in $$props) $$invalidate(2, innerWidth = $$props.innerWidth);
		if ("currentSize" in $$props) $$invalidate(11, currentSize = $$props.currentSize);
		if ("TXT_SIZE" in $$props) $$invalidate(12, TXT_SIZE = $$props.TXT_SIZE);
		if ("level" in $$props) $$invalidate(3, level = $$props.level);
	};

	let currentSize;
	let TXT_SIZE;
	let level;

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*innerWidth*/ 4) {
			 $$invalidate(10, isMobile = innerWidth < BREAKPOINT_S);
		}

		if ($$self.$$.dirty & /*size_mobile, size*/ 320) {
			 $$invalidate(6, size_mobile = size_mobile ? size_mobile : size);
		}

		if ($$self.$$.dirty & /*isMobile, size_mobile, size*/ 1344) {
			 $$invalidate(11, currentSize = isMobile ? size_mobile : size);
		}

		if ($$self.$$.dirty & /*currentSize*/ 2048) {
			 $$invalidate(12, TXT_SIZE = TXT_SIZES[currentSize - 1]);
		}

		if ($$self.$$.dirty & /*TXT_SIZE*/ 4096) {
			 $$invalidate(3, level = `${TXT_CLASS}${TXT_SIZE}`);
		}
	};

	return [
		look,
		link,
		innerWidth,
		level,
		getStyleCta,
		handleClick,
		size_mobile,
		tracking,
		size,
		content,
		isMobile,
		currentSize,
		TXT_SIZE,
		TXT_SIZES,
		onwindowresize
	];
}

class Cta extends SvelteElement {
	constructor(options) {
		super();

		this.shadowRoot.innerHTML = `<style>*,*:before,*:after{box-sizing:inherit}a{margin:0;padding:0;border:0;outline:0;font-weight:inherit;font-style:inherit;font-size:100%;font-family:inherit;vertical-align:baseline;-webkit-appearance:none}.c-Cta *,.c-Cta:before,.c-Cta:after,.c-Cta *:before,.c-Cta *:after,.c-Cta{margin:0;padding:0;box-sizing:border-box}.c-Cta{border:0;text-align:left;color:inherit;text-decoration:none;transition:.25s ease;background-color:transparent;cursor:pointer;font:inherit;margin:0;overflow:visible;text-transform:none;vertical-align:inherit;outline:none;padding:0;line-height:normal}.c-Cta::-moz-focus-inner{border-style:none;padding:0
    }.c-Cta:-moz-focusring{outline:1px dotted ButtonText
    }.c-Cta:focus{outline:none
    }.c-Cta:active,.c-Cta:hover{outline-width:0
    }.c-Cta:hover .c-Cta__text,.c-Cta:focus .c-Cta__text{text-decoration:none}.c-Cta__text__xl,.c-Cta__text__l,.c-Cta__text__m,.c-Cta__text__s,.c-Cta__text__xs{font-family:Lucas, Helvetica, Arial, sans-serif}.c-Cta__text__xl{font-size:24px;letter-spacing:2px;font-weight:300
    }.c-Cta__text__l{font-size:18px;letter-spacing:1px;font-weight:300
    }.c-Cta__text__m{font-size:16px;letter-spacing:1px;font-weight:400
    }.c-Cta__text__s{font-size:14px;letter-spacing:1px;font-weight:800
    }.c-Cta__text__xs{font-size:12px;letter-spacing:0;font-weight:400
    }.c-Cta{display:flex;flex:1 0 100%;padding:12px 24px;border-radius:.25em;justify-content:center;align-items:baseline;margin-top:24px}.c-Cta__text__icon{margin-left:.25em;transform:translateY(1px)}.c-Cta--primary,.c-Cta--subtle{min-width:200px}.c-Cta--primary{text-transform:uppercase;border:1px solid #877352;background-color:#877352}.c-Cta--primary .c-Cta__text{color:#FFFFFF !important}.c-Cta--subtle{border:1px solid #000000}.c-Cta--subtle .c-Cta__text,.c-Cta--primary .c-Cta__text{text-transform:uppercase}.c-Cta--primary:focus:not(:disabled),.c-Cta--primary:hover:not(:disabled){box-shadow:0 12px 24px 0 rgba(0, 0, 0, .5)}.c-Cta--subtle:focus:not(:disabled),.c-Cta--subtle:hover:not(:disabled){background-color:#000}.c-Cta--subtle:focus:not(:disabled) .c-Cta__text,.c-Cta--subtle:hover:not(:disabled) .c-Cta__text{color:#fff}@media screen and (max-width: 768px){.c-Cta{margin-top:16px}}@media screen and (max-width: 767px){.c-Cta--subtle{min-width:auto}}.c-Cta--link{border-radius:0;padding:0 0 2px 0;margin-top:8px;border-bottom:1px solid transparent}.c-Cta--link:not(.c-Cta--gold) .c-Cta__text.c-Cta__text__s{font-weight:inherit}.c-Cta--link:not(.c-Cta--gold):hover{border-color:white}.c-Cta--gold:hover{border-color:#877352}.c-Cta--inline{display:inline-flex}:host-context(.c-Zone--light) .c-Cta__text{color:#000}:host-context(.c-Zone--light) .c-Cta__text__icon path{fill:#000}:host-context(.c-Zone--dark) .c-Cta--subtle{border-color:#FFF}:host-context(.c-Zone--dark) .c-Cta__text{color:#FFF}:host-context(.c-Zone--dark) .c-Cta__text__icon path{fill:#FFF}.c-Cta--gold .c-Cta__text{font-weight:600}.c-Cta--gold .c-Cta__text,:host-context(.c-Zone--dark) .c-Cta--gold .c-Cta__text,:host-context(.c-Zone--light) .c-Cta--gold .c-Cta__text{color:#877352}.c-Cta--gold .c-Cta__text .c-Cta__text__icon path,:host-context(.c-Zone--dark) .c-Cta--gold .c-Cta__text__icon path,:host-context(.c-Zone--light) .c-Cta--gold .c-Cta__text__icon path{fill:#877352}</style>`;

		init(this, { target: this.shadowRoot }, instance, create_fragment, safe_not_equal, {
			tracking: 7,
			size: 8,
			size_mobile: 6,
			look: 0,
			content: 9,
			link: 1
		});

		const { ctx } = this.$$;
		const props = this.attributes;

		if (/*tracking*/ ctx[7] === undefined && !("tracking" in props)) {
			console.warn("<n-cta> was created without expected prop 'tracking'");
		}

		if (/*size*/ ctx[8] === undefined && !("size" in props)) {
			console.warn("<n-cta> was created without expected prop 'size'");
		}

		if (/*size_mobile*/ ctx[6] === undefined && !("size_mobile" in props)) {
			console.warn("<n-cta> was created without expected prop 'size_mobile'");
		}

		if (/*look*/ ctx[0] === undefined && !("look" in props)) {
			console.warn("<n-cta> was created without expected prop 'look'");
		}

		if (/*content*/ ctx[9] === undefined && !("content" in props)) {
			console.warn("<n-cta> was created without expected prop 'content'");
		}

		if (/*link*/ ctx[1] === undefined && !("link" in props)) {
			console.warn("<n-cta> was created without expected prop 'link'");
		}

		if (options) {
			if (options.target) {
				insert_dev(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["tracking", "size", "size_mobile", "look", "content", "link"];
	}

	get tracking() {
		return this.$$.ctx[7];
	}

	set tracking(tracking) {
		this.$set({ tracking });
		flush();
	}

	get size() {
		return this.$$.ctx[8];
	}

	set size(size) {
		this.$set({ size });
		flush();
	}

	get size_mobile() {
		return this.$$.ctx[6];
	}

	set size_mobile(size_mobile) {
		this.$set({ size_mobile });
		flush();
	}

	get look() {
		return this.$$.ctx[0];
	}

	set look(look) {
		this.$set({ look });
		flush();
	}

	get content() {
		return this.$$.ctx[9];
	}

	set content(content) {
		this.$set({ content });
		flush();
	}

	get link() {
		return this.$$.ctx[1];
	}

	set link(link) {
		this.$set({ link });
		flush();
	}
}

customElements.define("n-cta", Cta);

/* src/App.svelte generated by Svelte v3.21.0 */
const file$1 = "src/App.svelte";

function create_fragment$1(ctx) {
	let n_cta;
	let t1;
	let style;

	const block = {
		c: function create() {
			n_cta = element("n-cta");
			n_cta.textContent = "Discover more";
			t1 = space();
			style = element("style");
			style.textContent = "/*Import custom style or fonts*/";
			this.c = noop;
			set_custom_element_data(n_cta, "tracking", "`Hero CTA`");
			set_custom_element_data(n_cta, "link", "./order");
			set_custom_element_data(n_cta, "look", "primary");
			set_custom_element_data(n_cta, "size", "4");
			add_location(n_cta, file$1, 3, 0, 51);
			add_location(style, file$1, 10, 4, 221);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, n_cta, anchor);
			insert_dev(target, t1, anchor);
			append_dev(document.head, style);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(n_cta);
			if (detaching) detach_dev(t1);
			detach_dev(style);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props) {
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<n-app> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("n-app", $$slots, []);
	return [];
}

class App extends SvelteElement {
	constructor(options) {
		super();
		init(this, { target: this.shadowRoot }, instance$1, create_fragment$1, safe_not_equal, {});

		if (options) {
			if (options.target) {
				insert_dev(options.target, this, options.anchor);
			}
		}
	}
}

customElements.define("n-app", App);

const app = new App({
	target: document.body
});

module.exports = app;
