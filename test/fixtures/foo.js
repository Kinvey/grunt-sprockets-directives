//= include bar

var name = 'foo';

submit = function () {
    if (this.state() !== 'pending') {
        data.jqXHR = this.jqXHR =
            (that._trigger(
                'submit',
                $.Event('submit', {delegatedEvent: e}),
                this
            ) !== false) && that._onSend(e, this);
    }
    return this.jqXHR || that._getXHRPromise();
};
