import PackedNode from './packed-node.js';

export default class PackNode extends CustomElement {
	
	static bound = {
		
		changedCharacterData() {
			
			const { mo } = this;
			
			mo.disconnect(this),
			
			this.pack(),
			
			mo.observe(this, PackNode.characterDataObserverInit);
			
		}
		
	};
	
	static pack(element, packer) {
		
		const	{ pack } = PackNode, { childNodes, classList, dataset: { packAsis, packer: packerId } } = element,
				packed = new DocumentFragment();
		let i,l,i0,l0, child, content;
		
		// テキストノードが断片化されている場合、それらを統合する。その上でそれぞれのテキストノード内のテキストに String.prototype.trim を実行し、
		// その結果空のテキストノードになった場合、そのテキストノードを削除する。
		// asis に true を指定すると、この処理をスキップする。
		if (!packAsis) {
			
			element.normalize(), i = -1, l = childNodes.length;
			while (++i < l) (child = childNodes[i]) instanceof Text &&
				(child.textContent = (content = child.textContent.trim()), content || (child.remove(), --i, --l));
			
		}
		
		i = -1, l = childNodes.length,
		packer =	packer instanceof HTMLElement ? packer :
						(packer = document.getElementById(packerId)) instanceof HTMLTemplateElement ?
							packer.content.children[0] : (packer || document.createElement('span'));
		while (++i < l) {
			
			if ((child = childNodes[i]) instanceof Text) {
				
				i0 = -1, l += (l0 = (content = child.textContent).length) - 1;
				while (++i0 < l0) packed.appendChild(packer.cloneNode(false)).textContent = content[i0];
				
				element.replaceChild(packed, child);
				
			} else if ('packTransparent' in child.dataset) {
				
				pack(child, packer);
				
			}
			
		}
		
		//classList.add('packed');
		
	}
	
	static {
		
		this.tagName = 'pack-node',
		
		this.characterDataObserverInit = { subtree: true, childList: true, characterData: true };
		
	}
	
	constructor() {
		
		super();
		
		(this.mo = new MutationObserver(this.changedCharacterData)).observe(this, PackNode.characterDataObserverInit);
		
	}
	
	connectedCallback() {
		
		this.pack();
		
	}
	
	pack() {
		
		PackNode.pack(this), this.emit('packed', this);
		
	}
	
}