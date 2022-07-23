import { Property } from '../game.js';

export default class MeasureBox extends CustomElement {
	
	static bound = {
		
		mutatedChildList() {
			
			this.measure();
			
		},
		resized() {
			
			this.measure();
			
		}
		
	};
	
	static {
		
		this.tagName = 'measure-box',
		
		this.mutatedChildListOption = { childList: true };
		
	}
	
	constructor() {
		
		super(),
		
		this.observeMutation(this.mutatedChildList, this, MeasureBox.mutatedChildListOption),
		
		this.ro = new ResizeObserver(this.resized),
		this.ro.observe(this);
		
	}
	
	connectedCallback() {
		
		this.measure();
		
	}
	
	static get observedAttributes() {
		
		return [ 'min-member', 'max-member', 'min-width', 'max-width', 'min-height', 'max-height' ];
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			
			case 'min-member':
			case 'max-member':
			case 'min-width':
			case 'max-width':
			case 'min-height':
			case 'max-height':
			this.measure();
			break;
			
		}
		
	}
	
	measure() {
		
		const	{ children, maxMember, minMember, maxWidth, minWidth, maxHeight, minHeight } = this, l = children.length,
				n = minMember > l ? minMember : maxMember < l ? maxMember : l,
				{ height: h, width: w } = this.getBoundingClientRect(),
				rawMw = w / n,
				mw = rawMw > maxWidth ? maxWidth : rawMw < minWidth ? minWidth : rawMw,
				rawMh = h / n,
				mh = rawMh > maxHeight ? maxHeight : rawMh < minHeight ? minHeight : rawMh;
		let i, mx,my;
		
		this.style.setProperty('--measured-width', mw + 'px'),
		this.style.setProperty('--measured-height', mh + 'px'),
		
		i = -1;hi(mw);
		while (++i < l)	children[i].style.setProperty('--measured-x', mw * i + 'px'),
								children[i].style.setProperty('--measured-y', mh * i + 'px');
		
	}
	
	getValueAttr(name, min, defaultValue) {
		
		return this.hasAttribute(name) ? Property.num(this.hasAttribute(name), min) : defaultValue;
		
	}
	get maxMember() {
		
		return this.getValueAttr('max-member', 0, Infinity);
		
	}
	set maxMember(v) {
		
		this.setAttribute('max-member', v);
		
	}
	get minMember() {
		
		return this.getValueAttr('min-member', 0, 0);
		
	}
	set minMember(v) {
		
		this.setAttribute('min-member', v);
		
	}
	get maxWidth() {
		
		const v = this.getValueAttr('max-width', -Infinity, -1);
		
		return v < 0 ? this.getBoundingClientRect().width : v;
		
	}
	set maxWidth(v) {
		
		this.setAttribute('max-width', v);
		
	}
	get minWidth() {
		
		return this.getValueAttr('min-width', 0, 0);
		
	}
	set minWidth(v) {
		
		this.setAttribute('min-width', v);
		
	}
	get maxHeight() {
		
		const v = this.getValueAttr('max-height', -Infinity, -1);
		
		return v < 0 ? this.getBoundingClientRect().height : v;
		
	}
	set maxHeight(v) {
		
		this.setAttribute('max-height', v);
		
	}
	get minHeight() {
		
		return this.getValueAttr('min-height', 0, 0);
		
	}
	set minHeight(v) {
		
		this.setAttribute('min-height', v);
		
	}
	
}