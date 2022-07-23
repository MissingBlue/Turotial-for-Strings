export default class SP extends CustomElement {
	
	static bound = {
		
		play() {
			
			this.composeClosest('app-node')?.addLogs(this.cloneNode(true));
			
		},
		slotted() {
			
			this.slottedContent.closest('compute-node')?.dispatchEvent?.(new CustomEvent('compute'));
			//const	{ slottedContent } = this,
			//		contents = slottedContent.assignedNodes(), l = contents.length;
			//let i, content;
			//
			//i = -1;
			//while (++i < l) {
			//	
			//	if ('spDisabledPack' in (content = contents[i]).dataset  || content instanceof PackNode) continue;
			//	
			//	const packer = document.createElement('pack-node');
			//	
			//	packer.dataset.spDisabledPack = '',
			//	packer.slot = 'content',
			//	packer.append(content.children),
			//	this.appendChild(packer)
			//	content.
			//	
			//}
			//
			//const packer = document.createElement('pack-node');
			//
			//packer.dataset.spDisabledPack = '',
			//packer.slot = 'content',
			//packer.append(...contents),
			//this.appendChild(packer);
			
		}
		
	}
	
	static {
		
		this.tagName = 's-p',
		
		this.shadowElement = {
			
			slottedContent: 'slot[name="content"]'
			
		};
		
	}
	
	constructor() {
		
		super(),
		
		this.addEvent(this.slottedContent, 'slotchange', this.slotted);
		
	}
	
}