import { Chr, Composer, ParseHelper, Pattern, default as strings, Terms } from './strings.js';

document.getElementById('console-node').content.querySelector('input').value =
	'hi';

class Property {
	
	static num(value, min = -Infinity, max = Infinity, flag = 0, defaultValue = 0, coefficient = 1) {
		
		const { toNaNaN } = Property;
		
		value = typeof coefficient === 'function' ? coefficient(value, min, max, flag, defaultValue, coefficient) :
			((value = toNaNaN(value, defaultValue) * toNaNaN(coefficient, 1)) < min ? min : value > max ? max : value),
		
		flag & Property.IS_INTEGER && value !== Infinity && (value = value|0),
		value < 0 && (flag & Property.IS_UNSIGNED && (value = min > 0 ? min : 0));
		
		return value;
		
	}
	static toNaNaN(value, defaultValue) {
		
		return Number.isNaN(value = +value) ? defaultValue : value;
		
	}
	static normalize(value, flag, defaultValue) {
		
		return Property.num(value, value, value, flag, defaultValue);
		
	}
	
	static {
		
		this.IS_INTEGER = 1,
		this.IS_UNSIGNED = 2;
		
	}
	
	constructor(value, min, max, flag, defaultValue, coefficient) {
		
		this.set(...arguments);
		
	}
	
	valueOf() {
		
		return Property.num(this.value, this.min, this.max, this.flag, this.defaultValue, this.coefficient);
		
	}
	
	get() {
		
		return +this;
		
	}
	set(
		value,
		min = this.min ?? -Infinity,
		max = this.max ?? Infinity,
		flag = this.flag ?? 0,
		defaultValue = this.defaultValue,
		coefficient = this.coefficient ?? 1
	) {
		
		arguments.length === 1 || (
				
				this.setMin(min),
				this.setMax(max),
				
				this.flag = flag,
				this.defaultValue = defaultValue,
				this.coefficient = coefficient
				
			);
		
		return this.value = Property.num(value, this.min, this.max, this.flag, this.defaultValue, this.coefficient);
		
	}
	
	setMin(value, flag, defaultValue = -Infinity) {
		
		return this.setPropertyValue('min', value, value, value, flag, defaultValue);
		
	}
	setMax(value, flag, defaultValue = Infinity) {
		
		return this.setPropertyValue('max', value, flag, defaultValue);
		
	}
	setPropertyValue(name, value, flag = this.flag, defaultValue) {
		
		return this[name] = Property.normalize(value, flag, defaultValue);
		
	}
	
	// 以下の関数群の引数 returnsValue に真を示す値を指定すると、関数の戻り値が this.value ではなく、引数 value になる。
	// 以下の関数群は this.value [operator] value で計算を行なうが、引数 inverts に真を示す値を指定すると、
	// value [operator] this.value で計算を行なう。（つまり左辺と右辺を入れ替える）
	add(value, returnsValue, inverts) {
		
		return this.cal('+', value, returnsValue, inverts);
		
	}
	sub(value, returnsValue, inverts) {
		
		return this.cal('-', value, returnsValue, inverts);
		
	}
	mul(value, returnsValue, inverts) {
		
		return this.cal('*', value, returnsValue, inverts);
		
	}
	div(value, returnsValue, inverts) {
		
		return this.cal('/', value, returnsValue, inverts);
		
	}
	cal(operator, value, returnsValue, inverts) {
		
		value = Property.num(value);
		
		const b = inverts ? this.value : value;
		let a = inverts ? value : this.value;
		
		switch (operator) {
			case 'addition': case 'add': case '+': a += b; break;
			case 'subtruct': case 'sub': case '-': a -= b; break;
			case 'multiple': case 'mul': case '*': a *= b; break;
			case 'division': case 'div': case '/': a /= b; break;
			default: a = b;
		}
		
		a = this.set(a);
		
		return returnsValue ? value : a;
		
	}
	
}

class Game {
	
	static executor = {
		
		create(type, property, numbers) {
			
			const outputs = [], { gods } = this.world;
			let i,oi, v;
			
			oi = -1;
			for (v of gods) {
				
				i = -1, this.world.object[type] || (this.world.object[type] = new Set());
				while (++i < numbers) this.world.object[type].add(v.create(type, property));
				
				outputs[++oi] = `created ${numbers} ${type}(s).`;
				
			}
			
			this.world.job();
			
			return outputs;
			
		},
		
		browse(type) {
			
			const contents = [], { isNotLog } = Game;
			
			switch (type) {
				default:
				const content = document.createElement('iframe');
				content.src = type,
				content.sandbox = 'allow-same-origin',
				content[isNotLog] = true,
				contents[contents.length] = content;
			}
			
			return contents;
			
		}
		
	}
	
	static {
		
		this.isNotLog = Symbol('Game.isNotLog');
		
		this.GlobalPropertyFlag = Property.IS_INTEGER + Property.IS_UNSIGNED,
		this.GlobalCoefficient = new Property(1);
		
		const { create, browse } = this.executor;
		
		this.command = {
			
			create,
			
			browse
			
		};
		
	}
	
	constructor() {
		
		this.world = new World();
		
	}
	
	execute(executor, args) {
		
		const	{ command } = Game,
				exe = executor in command ? command : `No command such "${executor}".`,
				result = typeof exe === 'function' ? exe.apply(this, args) : exe;
		
		return result;
		
	}
	
}

class World {
	
	static {
		
	}
	
	constructor() {
		
		this.property = new Property(10000000, 0, undefined, Game.GlobalPropertyFlag, Game.GlobalCoefficient),
		
		(this.gods = new Set()).add(new God(this.property.sub(this.property / 100 * Math.random(), true))),
		hi(+this.property);
		this.object = {};
		
	}
	
	job() {
		
		const { object } = this;
		let k,v, p;
		
		for (k in object) {
			
			if (!((p = object[k]) instanceof Set)) continue;
			
			for (v of p) v.job();
			
		}
		
	}
	
}

class God {
	
	static {
	}
	
	constructor(property = 10000) {
		
		this.property = property;
		
	}
	
	born(partner) {
		
		return new God((this.property + partner.property) / 2);
		
	}
	
	create(type, property) {
		
		if (Number.isNaN(property = +property) || property < 0  || this.property < property) return;
		
		this.property -= property;
		
		switch (type) {
			case 'human':
			return new Human(property);
			case 'nature':
			return new Nature(property);
			case 'threat':
			return new Threat(property);
		}
		
	}
	
}

class Jobs extends Array {
	
	constructor() {
		
		super(arguments);
		
	}
	
}

class Job {
	
	static {
		
		this.main = Symbol('Job.main'),
		this.job = Symbol('Job.job');
		
	}
	constructor() {
		
		
	}
	
}
class JobSleep extends Job {
	
	static {
		
		
	}
	constructor() {
		
		super();
		
	}
	[Job.main](target) {
		
		target.factor = Math.max(target.factor += target.factor * 1, 1);
		
	}
	
}
class JobEat extends Job {
	
	static {
		
		
	}
	constructor() {
		
		super();
		
	}
	
	[Job.main](target) {
		
		target.potential += 1;
		target.factor = Math.max(target.factor += target.factor * 1, 1);
		
	}
	
}
class JobWork extends Job {
	
	static {
		
		
	}
	constructor() {
		
		super();
		
	}
	
	[Job.main](target) {
		
		target.potential += 1;
		target.factor = Math.max(target.factor += target.factor * 1, 1);
		
	}
	
}

class Stuff extends God {
	
	static {
		
		this.job = Symbol('Stuff.job');
		
	}
	
	constructor(property) {
		
		super(property),
		
		this.potential = this.property / 2,
		this.factor = 1,
		
		this.jobs = new Jobs(this.constructor.jobs);
		
	}
	
	[Job.job]() {
		
		const { main } = Job;
		
		return this.jobs[this.jobs.length * Math.random() |0][main]();
		
	}
	
}
class Human extends Stuff {
	
	static {
		
		this.jobs = [
			new JobSleep(),
			new JobEat(),
			new JobWork()
		];
		
	}
	
	constructor(property) {
		
		super(property);
		
	}
	
}

// Parser

class Parser extends ParseHelper {
	
	static branch(mask, masks, input, detail, self) {
		
		const	values = mask.inners[0].split(this.separator), l = values.length,
				dict = this[Terms.dict],
				s = Parser[ParseHelper.symbol],
				hyphen = dict[s.hyphen],
				integer = dict[s.integer],
				v = [];
		let i,i0,l0,i1, vi, value,value0;
		
		i = vi = -1;
		while (++i < l) {
			
			if (
				(value = values[i].trim()).search(hyphen).length !== -1 &&
				(l0 = (value0 = value.split(hyphen)).length) === 2
			) {
				
				i0 = -1;
				while (++i0 < l0 && ((!i && !value0[i]) || integer.test(value0[i])));
				if (i0 === l0) {
					
					i0 = (value0[0]|0) + (i1 = -1), l0 = (value0[1]|0) + 1;
					while (++i0 < l0) v[++vi] = i0;
					continue;
					
				}
				
			}
			
			v[++vi] = value;
			
		}
		
		return { v };
		
	}
	
	static createDict(indexOfSymbol, dict = {}, source = Parser.dict) {
		
		let k;
		
		for (k in source) dict[indexOfSymbol[k]] = source[k];
		
		return dict;
		
	}
	
	static {
		
		this[ParseHelper.esc] = null,
		
		this[ParseHelper.symbolNames] = [
			
			'brh',
			
			'branchLeft',
			'branchRight',
			
			'hyphen',
			
			'separator',
			
			'integer'
			
		];
		
		const	s = ParseHelper.setSymbols(this),
				dict = this.dict =	{
												
												[s.branchLeft]: new Pattern('['),
												[s.branchRight]: new Pattern(']'),
												
												[s.hyphen]: new Pattern('-'),
												
												[s.separator]: new Pattern(','),
												
												[s.integer]: /[\d０-９]*/g
												
											};
		
		this[ParseHelper.precedenceDescriptors] = [
			{ name: s.brh, term: [ s.branchLeft, s.branchRight ], esc: null, isFlat: true, callback: Parser.branch }
		];
		
	}
	
	constructor(configuration, esc = null, dict) {
		
		super(
			configuration,
			Parser,
			esc,
			{ ...Parser.dict, ...(dict && typeof dict === 'object' ? dict : {}) }
		);
		
		const d = this[Terms.dict], s = Parser[ParseHelper.symbol];
		
		this.separator = new Chr(d[s.separator], null),
		this.counter = new Chr([ d[s.integer], '?', d[s.hyphen], d[s.integer] ], null);
		
	}
	
	parse(str) {
		
		const commands = this.split(str, undefined, this.separator), l = commands.length;
		let i, cmd;
		
		i = -1;
		while (++i < l) (cmd = commands[i].trim()) && (commands[i] = this.get(cmd));
		
		return Composer.compose(commands.flat());
		
	}
	
	//[ParseHelper.main](block, parsed, plot, plotLength, input, detail, self) {
	//	
	//}
	
}

// Interfaces

class AppNode extends CustomElement {
	
	static bound = {
		
		input({ detail: { value } }) {
			
			const inputs = value && this.parser.parse(value);
			
			inputs?.length && this.run(inputs);
			
		}
		
	};
	
	static {
		
		this.tagName = 'app-node';
		
	}
	
	constructor(game = new Game(), parser = new Parser()) {
		
		if (!(game instanceof Game)) throw new TypeError('Argument 1 must be an instance of Game.');
		if (!(parser instanceof Parser)) throw new TypeError('Argument 2 must be an instance of Parser.');
		
		super();
		
		this.game = game,
		this.parser = parser,
		
		(this.heat = document.createElement('character-node')).dataset.data = '#character-heat',
		//(this.heat = document.createElement('character-node')).
		//	appendChild(document.getElementById('character-heat').content.cloneNode(true)),
		this.q('#data').appendChild(this.heat),
		
		this.addEventListener('input', this.input);
		
	}
	
	run(inputs) {
		
		this.process(this.parseAll(inputs)),
		this.process(this.heat.evaluateAll(inputs), this.heat.metadata);
		
	}
	
	parseAll(inputs) {
		
		const	{ iterator } = Symbol,
				l = (inputs = Array.isArray(inputs) ? inputs : [ inputs ]).length, data = [];
		let i,di, v;
		
		i = di = -1;
		while (++i < l) typeof (v = this.parse(inputs[i])) !== 'string' && typeof v[iterator] === 'function' ?
			(di = data.push(...v) - 1) : (data[++di] = v);
		
		return data;
		
	}
	
	parse(input) {
		
		return typeof input === 'string' ? this.game.execute((input = input.split(' '))[0], input.slice(1)) ?? '' : '';
		
	}
	
	process(data, placeholder) {
		
		const	l = (data = Array.isArray(data) ? data : [ data ]).length,
				browserNode = this.q('browser-node'),
				{ isNotLog } = this.game.constructor, logs = [];
		let i,i0;
		
		i = i0 = -1;
		while (++i < l) data[i][isNotLog] ? browserNode.setContent(i, data[i], true) : (logs[++i0] = data[i]);
		
		if (logs.length) {
			
			const dialogNodes = this.qq('dialog-node'), l = dialogNodes.length;
			
			i = -1;
			while (++i < l) dialogNodes[i].dialog?.addLogs?.(logs, placeholder);
			
		}
		
	}
	
}
class DialogNode extends CustomElement {
	
	static {
		
		this.tagName = 'dialog-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		this.logsNode.addLogs(logs, placeholder);
		
	}
	
	get dialog() {
		
		return this.q('slot[name="dialog"]').assignedElements()[0];
		
	}
	
}

class DisplayNode extends CustomElement {
	
	static {
		
		this.tagName = 'display-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}

class MeasureBox extends CustomElement {
	
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

class SpriteNode extends CustomElement {
	
	static bound = {
		
		resized() {
			
			this.calculate();
			
		},
		
		changedSlot() {
			
			const	assignedElements = this.slotNode.assignedElements(), l = assignedElements.length;
			let i;
			
			i = -1, this.ro.disconnect(), this.isConnected && this.ro.observe(this);
			while (++i < l) this.ro.observe(assignedElements[i]);
			
		}
		
	};
	
	static {
		
		this.tagName = 'sprite-node';
		
	}
	
	constructor() {
		
		super(),
		
		this.ro = new ResizeObserver(this.resized),
		
		(this.slotNode = this.q('slot[name="sprite"]')).addEventListener('slotchange', this.changedSlot);
		
	}
	
	connectedCallback() {
		
		this.calculate(),
		
		this.ro.observe(this);
		
	}
	disconnectedCallback() {
		
		this.ro?.unobserve?.(this);
		
	}
	
	calculate() {
		
		const	assignedElements = this.slotNode.assignedElements(), l = assignedElements.length;
		let i;
		
		// assignedNodes が複数存在する時の値の決定方法がわからないため、現状は機械的に後方の要素の値で既存の値を上書きする。
		
		i = -1;
		while (++i < l) {
			const { height: h, width: w } = assignedElements[i].getBoundingClientRect();
			this.setCSSVar('sprite-size-width', w),
			this.setCSSVar('sprite-size-height', h),
			this.setCSSVar('sprite-aspect-ratio-wh', w / h),
			this.setCSSVar('sprite-aspect-ratio-hw', h / w),
			this.setCSSVar('sprite-horizontal', +(w > h)),
			this.setCSSVar('sprite-vertical', +(w < h));
		}
		
	}
	
}

class ScenesNode extends CustomElement {
	
	static {
		
		this.tagName = 'scenes-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
class SceneNode extends CustomElement {
	static {
		this.tagName = 'scene-node';
	}
	constructor() {
		super();
	}
}

class CharacterNode extends CustomElement {
	
	static bound = {
		
	};
	
	static {
		
		this.tagName = 'character-node';
		
	}
	
	constructor() {
		
		super();
		
		this.setData();
		
	}
	static get observedAttributes() {
		
		return [ 'data-data' ];
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			case 'data-data': newValue === this.dataset.data || this.setData(newValue); break;
		}
		
	}
	
	setData(selector) {
		
		if (selector && selector !== this.dataset.data) {
			
			this.dataset.data = selector;
			return;
			
		}
		
		const dataNode = document.querySelector(selector || this.dataset.data);
		
		if (!(dataNode instanceof HTMLTemplateElement)) return;
		
		const content = dataNode.content.cloneNode(true);
		
		this.loadResources(content), this.appendChild(content);
		
	}
	
	loadResources(content) {
		
		const resources = content.getElementById('resources')?.children, l = resources.length;
		let i, r;
		
		i = -1;
		while (++i < l) {
			
			if (!(r = resources[i]).id) continue;
			
			switch ((r = resources[i]).tagName) {
				case 'IMG':
				r.decode().then((r => () => {
					
					document.documentElement.style.setProperty(`--img-${r.id}-url`, `url("${r.src}")`),
					document.documentElement.style.setProperty(`--img-${r.id}-width-px`, r.width + 'px'),
					document.documentElement.style.setProperty(`--img-${r.id}-width`, r.width),
					document.documentElement.style.setProperty(`--img-${r.id}-height-px`, r.height + 'px'),
					document.documentElement.style.setProperty(`--img-${r.id}-height`, r.height);
					
				})(r));
				break;
			}
			
		}
		
	}
	
	evaluateAll(inputs) {
		
		let i,l,i0, logs, values;
		
		i = -1, l = (Array.isArray(inputs) ? inputs : [ inputs ]).length, values = [];
		while (++i < l) values[i] = this.evaluate(inputs[i]);
		
		i = i0 = -1, l = (values = values.flat(1)).length, logs = [];
		while (++i < l) values[i]?.dialogs && (logs[++i0] = values[i]?.dialogs);
		
		return logs.flat(1);
		
	}
	
	evaluate(input) {
		
		const	conditions = this.querySelectorAll('#conditions > condition-node[data-has~="input"]'),
				l = conditions.length, values = [];
		let i;
		
		i = -1;
		while (++i < l) values[i] = conditions[i].evaluate(input);
		
		return values;
		
	}
	
	get metadata() {
		
		return this.querySelector('#metadata').get();
		
	}
	
}

class MetaData extends CustomElement {
	
	static {
		this.tagName = 'meta-data';
	}
	
	constructor() {
		super();
	}
	
	get() {
		
		const	isArray = !!this.querySelector(':scope > meta-datum:not([data-name])'),
				nodes = this.querySelectorAll(':scope > meta-datum, :scope > meta-data'), l = nodes.length,
				data = isArray ? [] : {};
		let i,i0, node;
		
		i = i0 = -1;
		while (++i < l) data[(node = nodes[i]).dataset?.name ?? ++i0] = node.get();
		
		return data;
		
	}
	
}
class MetaDatum extends CustomElement {
	
	static {
		this.tagName = 'meta-datum';
	}
	
	constructor() {
		super();
	}
	
	get(as = this.dataset.type) {
		
		let v;
		
		switch (as) {
			
			case 'boolean':
			v = this.textContent.trim();
			return v === '0' || v.toLowerCase() === 'false' ? false : !!v;
			
			case 'number': return +this.textContent.trim();
			
			case 'undefined': return undefined;
			
			case 'null': return null;
			
			case 'json':
			try {
				v = JSON.parse(this.textContent.trim());
			} catch(error) {
				v = null, console.error(error);
			}
			return v;
			
			case 'dom':
			(v = document.createDocumentFragment()).append(...this.cloneNode(true).children);
			return v;
			
			case 'text': return this.innerText.trim();
			
			default: return this.textContent.trim();
			
		}
		
	}
	
}

class ConditionNode extends CustomElement {
	
	static bound = {
		
		mutatedChildList() {
			
			this.updateHint();
			
		}
		
	};
	
	static {
		
		this.tagName = 'condition-node',
		
		this.result = Symbol('ConditionNode.result'),
		
		this.conditionNodes = [ 'condition-node', 'condition-evaluation' ],
		
		this.conditionTagNames = new RegExp(`^(?:${this.conditionNodes.join('|')})$`, 'i'),
		this.conditionNodesSelector = `:scope > ${this.conditionNodes.join(',')}`,
		
		this.mutatedChildListOption = { childList: true };
		
	}
	
	constructor() {
		
		super(),
		
		this.observeMutation(this.mutatedChildList, this, ConditionNode.mutatedChildListOption),
		
		this.updateHint();
		
	}
	
	updateHint() {
		
		const	conditions = this.querySelectorAll(ConditionNode.conditionNodesSelector), l = conditions.length,
				types = new Set();
		let i;
		
		i = -1;
		while (++i < l) types.add(conditions[i].dataset?.type ?? 'input');
		
		this.dataset.has = [ ...types ].join(' ');
		
	}
	
	evaluate(input, evaluated) {
		
		(evaluated && typeof evaluated === 'object') || (evaluated = {});
		
		const	{ result: symResult } = ConditionNode,
				result = this.querySelector(':is(condition-evaluation, condition-node):first-child')?.evaluate?.(input),
				executions = this.querySelectorAll(`:scope > condition-${result[symResult]}`), l = executions.length;
		let next;
		
		evaluated = { ...evaluated, [symResult]: result[symResult] };
		
		if (l) {
			
			let i, exec;
			
			i = -1;
			while (++i < l) evaluated[(exec = executions[i]).dataset.name] = exec.execute();
			
			this.emit(result, evaluated);
			
		}
		
		if (result) {
			
			const { conditionTagNames } = ConditionNode;
			
			next = this.nextSibling;
			while (!conditionTagNames.test(next.tagName) && (next = next.nextSibling));
			
		}
		
		return next?.evaluate?.(input, evaluated) ?? evaluated;
		
	}
	
}
class ConditionEvaluation extends CustomElement {
	
	static {
		
		this.tagName = 'condition-evaluation';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	evaluate(input, evaluated = {}) {
		
		(evaluated && typeof evaluated === 'object') || (evaluated = {});
		
		const { condition, logic = 'and', type } = this.dataset;
		let result, next, left;
		
		switch (type) {
			default: left = input;
		}
		
		switch (condition) {
			default: result = this.isEqual(left);
		}
		
		if ((evaluated[ConditionNode.result] = result) ? logic === 'or' : logic === 'and') return evaluated;
		
		const { conditionTagNames } = ConditionNode;
		
		next = this.nextSibling;
		while (!conditionTagNames.test(next.tagName) && (next = next.nextSibling));
		
		return next?.evaluate?.(left, evaluated) ?? evaluated;
		
	}
	
	isEqual(left) {
		switch (this.dataset.valueType) {
			case 'regexp': return this.valueOf().test(left);
			default: return left === this;
		}
	}
	
	valueOf() {
		switch (this.dataset.valueType) {
			case 'number': return +this.textContent;
			case 'regexp': return new RegExp(this.textContent, this.dataset?.regexpOption ?? '');
			default: return this.textContent;
		}
	}
	
}
class ConditionExecution extends CustomElement {
	
	static {
		this.tagName = 'condition-execution';
	}
	
	constructor() {
		super();
	}
	
	execute() {
		
		switch (this.dataset.type) {
			case 'query-selector':
			return this.getRootNode().querySelector(this.textContent)?.cloneNode?.(true);
			case 'query-selector-all':
			const nodes = this.getRootNode().querySelectorAll(this.textContent), l = nodes.length, values = [];
			let i, v;
			
			i = -1;
			for (v of nodes) values[++i] = v.cloneNode(true);
			
			return values;
		}
		
	}
	
}
class ConditionTrue extends ConditionExecution {
	static {
		this.tagName = 'condition-true';
	}
	constructor() {
		super();
	}
}
class ConditionFalse extends ConditionExecution {
	static {
		this.tagName = 'condition-false';
	}
	constructor() {
		super();
	}
}

class LogsNode extends CustomElement {
	
	static {
		
		this.tagName = 'logs-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		const logsContainer = document.createElement('logs-container');
		
		logsContainer.addLogs(logs, placeholder),
		
		this.root.prepend(logsContainer);
		
	}
	
}
class LogsContainer extends CustomElement {
	
	static {
		
		this.tagName = 'logs-container';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		const l = (Array.isArray(logs) ? logs : (logs = [ logs ])).length, logNodes = [];
		let i, slotNode;
		
		i = -1;
		while (++i < l) (logNodes[i] = document.createElement('log-node')).setContent(logs[i], placeholder);
		
		this.root.prepend(...logNodes);
		
	}
	
}
class LogNode extends CustomElement {
	
	static replace(node, placeholder) {
		
		if (!(placeholder && typeof placeholder === 'object')) return;
		
		const { children } = node, l = children.length, { replace } = LogNode;
		let i;
		
		if (l) {
			
			i = -1;
			while (++i < l) replace(children[i], placeholder);
			
		} else node.innerText = strings(node.innerText, placeholder)[0];
		
		return node;
		
	}
	
	static {
		
		this.tagName = 'log-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	setContent(content, placeholder) {
		
		const slotNode = this.querySelector('[slot="content"]') || document.createElement('div');
		
		slotNode.slot = 'content',
		slotNode.append(content instanceof Node ? LogNode.replace(content, placeholder) : content),
		this.appendChild(slotNode);
		
	}
	
}

class ConsolesNode extends CustomElement {
	
	static bound = {};
	
	static {
		
		this.tagName = 'consoles-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
class ConsoleNode extends CustomElement {
	
	static bound = {
		
		clickedSendButton() {
			
			this.emitInput();
			
		},
		pressedKey(event) {
			
			switch (event.key) {
				case 'Enter': this.emitInput(); break;
			}
			
		}
		
	};
	static {
		
		this.tagName = 'console-node';
		
	}
	
	constructor() {
		
		super();
		
		(this.input = this.q('#inputform')).addEventListener('keypress', this.pressedKey),
		this.q('#send').addEventListener('click', this.clickedSendButton);
		
	}
	connectedCallback() {
		
		this.abortEvents();
		
	}
	emitInput() {
		
		this.closest('console-node')?.emit('input', this);
		
	}
	
	get value() {
		
		return this.input.value;
		
	}
	set value(v) {
		
		this.input.value = v;
		
	}
	
}

class BrowserNode extends CustomElement {
	
	static bound = {
		
		clickedTab(event) {
			
			event.target.classList.contains('shown') || this.showTabsExclusive(event.target);
			
		},
		resized(entries) {
			
			this.style.setProperty(
					'--content-height',
					this.root.getBoundingClientRect().height - this.q('browser-tabs').getBoundingClientRect().height + 'px'
				);
			
		},
		shownTab(event) {
			
			event.detail[BrowserNode.tabContent].classList.add('shown');
			
		},
		hiddenTab(event) {
			
			event.detail[BrowserNode.tabContent].classList.remove('shown');
			
		},
		destroyedTab(event) {
			
			event.target[BrowserNode.tabContent].remove();
			
		}
		
	};
	
	static {
		
		this.tabContent = Symbol('BrowserNode.tabContnet'),
		this.constrainedTab = Symbol('BrowserNode.constrainedTab'),
		
		this.tagName = 'browser-node';
		
	}
	
	constructor() {
		
		super();
		
		this.tabsNode = this.q('browser-tabs'),
		
		this.ro = new ResizeObserver(this.resized),
		this.ro.observe(this.q('#view'));
		
	}
	
	setContent(name, content, shows) {
		
		const	tab = new BrowserTab(name),
				contentNode = document.createElement('div');
		
		contentNode.slot = 'view',
		contentNode.classList.add('tab-content'),
		contentNode[BrowserNode.constrainedTab] = tab,
		contentNode.appendChild(content),
		this.appendChild(contentNode),
		
		tab[BrowserNode.tabContent] = contentNode,
		tab.addEventListener('clicked-tab', this.clickedTab),
		tab.addEventListener('shown', this.shownTab),
		tab.addEventListener('hidden', this.hiddenTab),
		tab.addEventListener('destroyed', this.destroyedTab),
		
		this.tabsNode.appendChild(tab),
		
		shows && this.showTabsExclusive(tab);
		
		return tab;
		
	}
	
	showTabsExclusive(...tabs) {
		
		const shownTabs = this.tabsNode.querySelectorAll('browser-tab.shown'), l = shownTabs.length;
		let i;
		
		i = -1;
		while (++i < l) shownTabs[i].classList.remove('shown');
		
		this.showTabs(...tabs);
		
	}
	
	showTabs(...tabs) {
		
		const l = tabs.length;
		let i, t;
		
		i = -1;
		while (++i < l)	typeof (t = tabs[i]) === 'string' && (t = this.q('#browser-tabs').q('#' + t));
								t && (t instanceof BrowserTab ? t : (t = this.setContent('', t))).classList.add('shown');
		
	}
	
}
class BrowserTabs extends CustomElement {
	
	static bound = {
	};
	
	static {
		
		this.tagName = 'browser-tabs';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
//class BrowserContent extends CustomElement {
//	static {
//	}
//	constructor() {
//		
//		super();
//		
//	}
//}
class BrowserTab extends CustomElement {
	
	static bound = {
		
		clicked(event) {
			
			this.emit('clicked-tab', this);
			
		},
		pressedDelete(event) {
			
			this.destroy();
			
		}
		
	};
	static get observedAttributes() {
		return [ 'class' ];
	}
	
	static {
		
		this.tagName = 'browser-tab';
		
	}
	
	constructor(name) {
		
		super();
		
		this.addEvent(this, 'click', this.clicked),
		this.addEvent(this.deleteNode = this.q('delete-node'), 'pressed-delete', this.pressedDelete),
		
		this.name = name;
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			
			case 'class':
			
			const shown = this.classList.contains('shown') && 'shown';
			
			(
				!(oldValue = oldValue && oldValue.split(' ').indexOf('shown')) ||
				(shown ? oldValue === -1 : oldValue !== -1)
			) && this.emit(shown || 'hidden', this);
			
			break;
			
		}
		
	}
	
	get name() {
		
		return this.tabName?.textContent ?? '';
		
	}
	set name(v) {
		
		(
			this.tabName ||
				(
					this.tabName = document.createElement('div'),
					this.tabName.id = 'tab-name',
					this.tabName.slot = 'name',
					this.appendChild(this.tabName)
				)
		).textContent = v;
		
	}
	
}
class Emitter extends CustomElement {
	
	static bound = {
		
		dispatch(event) {
			
			const { type } = this, emissions = type[event.type];
			let v;
			
			for (v of emissions) this.emit(v || 'emit', this);
			
		}
		
	};
	
	static {
		
		this.tagName = 'emit-node';
		
	}
	
	constructor(emission) {
		
		super();
		
		this.type = {},
		
		this.addEmission(emission);
		
	}
	addEmission(emission) {
		
		if (!emission || typeof emission !== 'object') return;
		
		const { type } = this;
		
		let i,l,k, t,t0;
		
		for (k in emission) {
			i = -1, l = (Array.isArray(t = emission[k]) ? t : (t = [ t ])).length;
			while (++i < l)	typeof (t0 = t[i]) === 'string' && (
											(type[t0] || (type[t0] = new Set())).add(k),
											this.addEvent(this, t0, this.dispatch)
										);
		}
		
	}
	removeEmission(emissionName) {
		
		const { type } = this;
		let v, t;
		
		for (v of type) (t = type[v]).has?.(emissionName) && (t.delete(emissionName), t.size || delete type[v]);
		
	}
	
}
class DeleteNode extends Emitter {
	
	static {
		
		this.tagName = 'delete-node',
		
		this.emission = {
			'pressed-delete': [ 'click' ]
		}
		
	}
	
	constructor(emission) {
		
		super(emission || DeleteNode.emission);
		
	}
	
}

defineCustomElements(
	
	AppNode,
	DisplayNode,
	DialogNode,
	SpriteNode,
	ScenesNode,
	SceneNode,
	LogsNode,
	LogsContainer,
	LogNode,
	ConsolesNode,
	ConsoleNode,
	BrowserNode,
	BrowserTabs,
	BrowserTab,
	DeleteNode,
	
	CharacterNode,
	
	MetaData,
	MetaDatum,

	ConditionNode,
	ConditionEvaluation,
	ConditionTrue,
	ConditionFalse,
	
	MeasureBox
	
);