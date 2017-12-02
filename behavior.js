function Behavior(states, subject) {
    this.states = states;
    this.subject = subject;

    this.elapsed = 0;
    this.index = 0;
    this.state = 'idle';

    this.frame = this.getCurrentFrame();
    this.performAction();
}

Behavior.prototype.getCurrentFrame = function() {
    return this.states[this.state].frames[this.index];
};

Behavior.prototype.advanceFrame = function() {
    var nextState = this.frame.after;
    var nextIndex = this.index + 1;
    var maxIndex = this.states[this.state].frames.length;

    if (nextState) {
        this.state = this.performExit(nextState) || nextState;
        nextIndex = 0;
    } else if (nextIndex >= maxIndex) {
        nextIndex = 0;
    }

    this.index = nextIndex;
    this.frame = this.getCurrentFrame();

    if (nextState) {
        this.performEnter();
    }
};

Behavior.prototype.performExit = function() {
    var exit = this.states[this.state].exit;

    if (exit) {
        return exit(this.subject);
    }
};

Behavior.prototype.performEnter = function() {
    var enter = this.states[this.state].enter;

    if (enter) {
        enter(this.subject);
    }
}

Behavior.prototype.performUpdate = function() {
    var update = this.states[this.state].update;

    if (update) {
        update(this.subject);
    }
}

Behavior.prototype.performAction = function() {
    var act = this.frame['action'];

    if (act) {
        act(this.subject);
    }
}

Behavior.prototype.update = function(dt) {
    this.elapsed = this.elapsed + dt;

    while (this.elapsed >= this.frame.duration) {
        this.elapsed = this.elapsed - this.frame.duration;
        this.advanceFrame();
        this.performAction();
    }

    this.performUpdate();
}

Behavior.prototype.setState = function(state, index) {
    state = this.performExit(state) || state;

    if (state != '__cancel_exit__') {
        this.state = state;
        this.index = index || 0;
        this.elapsed = 0;
        this.frame = this.getCurrentFrame();
        this.performEnter();
        this.performAction();
    }
}

Behavior.prototype.changeState = function(state, index) {
    if (state != this.state) {
        this.setState(state, index);
    }
}
