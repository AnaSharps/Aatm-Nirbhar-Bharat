const tf = require('@tensorflow/tfjs-node');

const x = tf.tensor1d([1, 2, 3, 4]);
const y = tf.tensor2d([[1, 2, 3, 4], [2, 3, 4, 5]]);
x.dot(tf.transpose(y)).print();
// x.dot(tf.transpose(y)).reshape([1, -1])[0].print();
const z = y[0];
console.log(z);
