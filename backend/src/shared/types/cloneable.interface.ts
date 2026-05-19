/**
 * @pattern Prototype
 * @intent Interface marker untuk semua objek yang bisa di-clone secara deep copy,
 *         digunakan agar "preview move" bisa dilakukan tanpa mengubah state asli.
 * @participants GameState (ConcretePrototype)
 */
export interface Cloneable<T> {
  clone(): T;
}
