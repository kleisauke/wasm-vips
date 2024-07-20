Object.assign(ClassHandle.prototype, {
  'preventAutoDelete' () {
    const index = deletionQueue.indexOf(this);
    if (index > -1) {
      deletionQueue.splice(index, 1);
    }
    this.$$.deleteScheduled = false;
    return this;
  }
});
