import ConditionExecution from './condition-execution.js';

export default class ConditionFalse extends ConditionExecution {
	
	static {
		
		this.tagName = 'condition-false';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}