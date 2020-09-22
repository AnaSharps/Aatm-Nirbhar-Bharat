const tf = require('@tensorflow/tfjs-node');

const x = tf.sparse.SpareTensor([[1, 2], [1, 4]], [2, 4], [2, 4]).print()
// x.dot(tf.transpose(y)).reshape([1, -1])[0].print();
// const z = y[0];
// console.log(z);
