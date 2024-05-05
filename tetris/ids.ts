export class IdProvider {
  id = 1;
  next() {
    this.id += 1;
    return this.id.toString();
  }
}
