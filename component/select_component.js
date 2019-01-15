let stack = [];

class StateMachine {

    constructor(description) {
        this.machineInfo = description;
        this.currentStateName = description.initialState;
    }

    recursiveInvoke(event, actionObject) {
        if (Array.isArray(actionObject)) {
            for (let i = 0; i < actionObject.length; i++) {
                this.recursiveInvoke(event, actionObject[i]);
            }
        } else if (typeof actionObject === 'string') {
            this.recursiveInvoke(event, this.machineInfo.actions[actionObject]);
        } else if (typeof actionObject === 'function') {
            stack.push({machine: this, event: event});
            actionObject(event);
            stack.pop();
        }
    }

    transition(transitionName, event) {
        let transition = this.machineInfo.states[this.currentStateName].on[transitionName];
        this.recursiveInvoke(event, transition.service || (() => {
            const [st, setState] = useState();
            setState(transition.target);
        }));
    }
}

export function machine(description) {
    return new StateMachine(description);
}

export function useContext() {
    let {machine, event} = {...stack[stack.length - 1]};
    if (!machine) {
        throw new Error("Method useContext() was invoked from outside the instantiated state machine");
    }

    let setContext = function (newContext) {
        machine.machineInfo.context = {...machine.machineInfo.context, ...newContext}; //merge content
    };
    return [machine.machineInfo.context, setContext];
}

export function useState() {
    let {machine, event} = {...stack[stack.length - 1]};
    if (!machine) {
        throw new Error("Method useState() was invoked from outside the instantiated state machine");
    }

    let setState = function (newStateName) {
        let onExit = machine.machineInfo.states[machine.currentStateName].onExit;
        machine.recursiveInvoke(event, onExit);
        machine.currentStateName = newStateName; // set new state
        let onEntry = machine.machineInfo.states[machine.currentStateName].onEntry;
        machine.recursiveInvoke(event, onEntry);
    };
    return [machine.currentStateName, setState];
}

export function assert(check, msg) {
    if (check) return;
    throw new Error(msg || "Assertion failed!");
}
