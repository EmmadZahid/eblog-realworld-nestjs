function toThrowErrorObject(received, expectedObject) {
    if (received && received.message) {
        if (expectedObject.message == received.message) {
            return {
                message: () => 'matched',
                pass: true,
            };
        }
    }

    return {
        message: () => 'not matched',
        pass: false,
    };
}

expect.extend({
    toThrowErrorObject,
});
