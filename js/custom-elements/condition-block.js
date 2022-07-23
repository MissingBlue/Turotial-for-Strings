import SubscriptionNode from './subscription-node.js';
import ScriptProxyHandler from './script-proxy-handler.js';
import ConditionProxyHandler from './condition-proxy-handler.js';

export default class ConditionBlock extends SubscriptionNode {
	
	static bound = {
		
	};
	
	static operator = {
		
		true(evaluated) {
			
			const l = evaluated.length, isOr = this.logic === 'or';
			let i;
			
			i = -1;
			while (++i < l && (isOr ? evaluated[i] === false : evaluated[i] !== false));
			
			return isOr ? i < l : i === l;
			
		},
		equal([ left, right ]) {
			
			return arguments[0].length < 2 || (this.strict ? left === right : left == right);
			
		},
		greater([ left, right ]) {
			
			return arguments[0].length < 2 || (left > right);
			
		},
		greaterEqual([ left, right ]) {
			
			return arguments[0].length < 2 || (left >= right);
			
		},
		less([ left, right ]) {
			
			return arguments[0].length < 2 || (left < right);
			
		},
		lessEqual([ left, right ]) {
			
			return arguments[0].length < 2 || (left <= right);
			
		}
		
	};
	
	static {
		
		// 覚え書き用、いずれのプロパティも現在は未使用
		
		this.op = [
			'true',		// 既定値、内包する要素が持つメソッド evaluate の戻り値が false を示す値でなければ真とする。
			'false',		// true の逆。実装上は存在せず、op="true" か、op未指定の時に not を指定すると同様の機能を果たす。
			'equal',		// 内包する condition-block の中から、直近の op="left", op="right" を示す二つの要素を一組だけ選び、その戻り値の等価を確認。
			'greater',
			'greater-equal',
			'less',
			'less-equal',
			'left', // 比較演算で内包されている時にのみ有効な値。比較の左辺であることを明示する。それ以外の機能は持たない。
			'right'
		],
		// op="true" ないし op が未指定の時にのみ有効な属性
		this.logic = [
			'and', // 既定値。内包する要素がすべて真を示す場合、真と評価する。
			'or' // 内包する要素の内、ひとつでも真を示せば、真と評価する。
		],
		
		//
		
		this.noReturnValue = Symbol('ConditionBlock.noReturnValue'),
		
		this[ScriptProxyHandler.noRecursion] = true,
		
		this.tagName = 'condition-block',
		
		this.input = Symbol('ConditionBlock.input'),
		this.anon = Symbol('ConditionBlock.anon'),
		
		this[ConditionProxyHandler.iteratorName] = 'evaluations',
		this.evaluationsSelectorBanList = new Set(),
		this.evaluationsSelector = ':scope > *',
		this.ban = (v = '') => typeof v === 'string' &&
			(this.evaluationsSelector = `:scope > :not(${[ ...this.evaluationsSelectorBanList.add(v) ].join(',')})`),
		this.unban = (v) => this.evaluationsSelectorBanList.remove(v) && this.ban(),
		
		this.comparisonOps = [ 'equal', 'greater', 'greater-equal', 'less', 'less-equal' ],
		this.comparisonSelectorLeft =
			`:scope > [op="left"], :scope > ${ConditionBlock.tagName}:not([op="right"]):nth-of-type(1)`,
		this.comparisonSelectorRight =
			`:scope > [op="right"], :is(${this.comparisonSelectorLeft}) ~ ${ConditionBlock.tagName}:not([op="left"])`,
		
		this.ops = {
			'greater-equal': 'greaterEqual',
			'less-equal': 'lessEqual',
			left: 'true',
			right: 'true'
		};
		
	}
	
	constructor() {
		
		super(),
		
		this.ops = ExtensionNode.bind(this.constructor.spread(this, 'operator'), this);
		
	}
	
	async play() {
		
		await this.begin();
		
	}
	
	async execute() {
		
		await this.begin();
		
	}
	
	async begin(shared) {
		
		const	{ proxy, revoke } = Proxy.revocable(this, ConditionProxyHandler),
				asyncIterator = proxy[Symbol.asyncIterator](shared),
				values = [];
		let i;
		
		i = -1;
		for await (const evaluated of asyncIterator) values[++i] = evaluated;
		
		const isTrue = await this.evaluate(values, shared);
		
		revoke();
		
		return isTrue;
		
	}
	
	async evaluate(values, shared) {
		
		const { op } = this;
		let isTrue;
		
		isTrue = this.ops[ConditionBlock.ops?.[op] || op]?.(values) ?? true, this.not && (isTrue = !isTrue);
		
		for (const exec of this.querySelectorAll('condition-' + isTrue)) await exec.execute(values, shared);
		
		return isTrue;
		
	}
	
	isComparison() {
		
		return ConditionBlock.comparisonOps.indexOf(this.op) !== -1;
		
	}
	
	get evaluations() {
		
		return this.isComparison() ?	[
													this.querySelector(ConditionBlock.comparisonSelectorLeft),
													this.querySelector(ConditionBlock.comparisonSelectorRight)
												] :
												this.querySelectorAll(ConditionBlock.evaluationsSelector);
		
	}
	
	get assignName() {
		
		this.getAttribute('assign-name');
		
	}
	set assignName(v) {
		
		this.setAttribute('assign-name', v);
		
	}
	
	get logic() {
		
		return this.getAttribute('logic')?.toLowerCase?.() ?? 'and';
		
	}
	set logic(v) {
		
		return this.setAttribute('logic', v);
		
	}
	
	get op() {
		
		return this.hasAttribute('op') ? this.getAttribute('op') : 'true';
		
	}
	set op(v) {
		
		this.setAttribute('op', v);
		
	}
	
	get strict() {
		
		return this.hasAttribute('strict');
		
	}
	set strict(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('strict', v);
		
	}
	get not() {
		
		return this.hasAttribute('not');
		
	}
	set not(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('not', v);
		
	}
	
}