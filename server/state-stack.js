class StateStack {
    /**
     *  @example
     *  ```
     *  class YourClass extends StateStack {
     *      // the function onChange() is called every time the state changes, and is passed the new state
     *      // override this function to do what you want with the new state
     *      onChange(newState) {
     *          // do something with the new state
     *      }
     * 
     *      // the function onReject() is called when the state changes to a rejected state
     *      // override this function if you don't want an error thrown
     *      onReject() {
     *          // do something on rejection
     *      }
     *  
     *      // the function onClear() is called when the stack is cleared
     *      // override this function to do what you want with the stack being cleared
     *      onClear() {
     *          // do something on clearing
     *      }
     *  }
     * 
     *  // create a new instance of YourClass
     *  const yourClass = new YourClass();
     * 
     *  // add a new state to the stack
     *  yourClass.addState(yourState); // yourState can be anything you want, it will be passed to onChange()
     * 
     *  // go to the 'next' or 'prev' state
     *  // these will call onChange() with the new state, or if there are no states, it will call onReject()
     *  yourClass.next();
     *  yourClass.prev();
     * 
     *  // resolves the current state
     *  yourClass.resolve();
     *  ```
     */
    constructor() {
        this.states = [];
        this.currentState = null;
        this.currentIndex = -1;
        this.branches = [];
        this.currentBranch = -1;
    }

    // branch(states, index) {
    //     // newStates = all states after and including index
    //     const newStates = states.slice(index);
    //     this.branches.push({
    //         states,
    //         index
    //     });
    // }

    // findBranch(index) {
    //     const branch = this.branches.find(b => b.index == index);
    //     if (branch) return branch;
    //     return null;
    // }

    /**
     * 
     * @param {Any} state Anything
     * @returns Copied state with no dependencies
     */
    copyState(state) {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * 
     * @param {Any} state This can be anything, it will be passed to onChange()
     */
    addState(state) {
        if (this.currentIndex < this.states.length - 1) {
            // remove all states after currentIndex
            this.states = this.states.splice(0, this.currentIndex + 1);

            this.states.push(this.copyState(state));
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        } else {
            this.states.push(this.copyState(state));
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        }

        this.resolve();
    }

    /**
     *  @description Destroys the stack and calls onClear()
     */
    clearStates() {
        this.states = [];
        this.currentIndex = -1;
        this.currentState = null;
        this.onClear();
    }

    // clearBranches() {
    //     this.branches = [];
    // }

    /**
     * @description Goes to the next state in the stack
     */
    next() {
        if (this.states.length > 0 && this.currentIndex < this.states.length - 1) {
            this.currentState = this.states[this.currentIndex + 1];
            this.currentIndex++;

            this.resolve();
        } else {
            this.onReject(this.currentState);
        }
    }

    /**
     * @description Goes to the previous state in the stack
     */
    prev() {
        if (this.states.length > 0 && this.currentIndex > 0) {
            this.currentState = this.states[this.currentIndex - 1];
            this.currentIndex--;
            // this.findBranch(this.currentIndex);
            this.resolve();
        } else {
            this.onReject(this.currentState);
        }
    }

    /**
     * @description Gets the number of states in the current stack
     */
    get numStacks() {
        return this.states.length;
    }

    // nextBranch() {
    //     if (this.branches.length > 0 && this.currentBranch < this.branches.length - 1) {
    //         this.currentBranch++;
    //         this.currentState = this.branches[this.currentBranch].states[this.branches[this.currentBranch].index];
    //         this.currentIndex = this.branches[this.currentBranch].index;
    //         this.resolve();
    //     } else {
    //         this.rejectCallback();
    //     }
    // }

    // prevBranch() {
    //     if (this.branches.length > 0 && this.currentBranch > 0) {
    //         this.currentBranch--;
    //         this.currentState = this.branches[this.currentBranch].states[this.branches[this.currentBranch].index];
    //         this.currentIndex = this.branches[this.currentBranch].index;
    //         this.resolve();
    //     } else {
    //         this.rejectCallback();
    //     }
    // }

    /**
     * @description Resolves the current state
     */
    resolve() {
        this.onChange(this.currentState);
    }

    /**
     *  @description Customizable callback for when the state changes
     */
    onChange() {

    }

    /**
     *  @description Customizable callback for when the state changes to a rejected state
     */
    onReject() {
        throw new Error('State does not exist, nothing has changed');
    }

    /**
     * @description Customizable callback for when the stack is cleared
     */
    onClear() {

    }
}


module.exports = {
    StateStack
};