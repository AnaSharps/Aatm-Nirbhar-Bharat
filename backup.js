/* eslint-disable max-len */
/* eslint-disable linebreak-style */
const tf = require('@tensorflow/tfjs-node');

function implicitALS(dataSparse, alpha, iterations, lambda, features) {
  const confidence = tf.multiply(dataSparse, alpha);
  const [userSize, jobSize] = dataSparse.dense_shape;

  const X = tf.random.normal([userSize, features]);
  const Y = tf.random.normal([jobSize, features]);

  const XI = dataSparse.matMul(tf.eye(userSize));
  const YI = dataSparse.matMul(tf.eye(jobSize));

  const I = tf.eye(features);
  const lI = tf.multiply(I, lambda);

  for (let i = 0; i < iterations; i += 1) {
    console.log(`iteration ${i + 1} of ${iterations}`);
    const yTy = tf.transpose(Y).dot(Y);
    const xTx = tf.transpose(X).dot(X);

    for (let u = 0; u < userSize; u += 1) {
      const userRow = confidence[u];
      const userPref = userRow.map((val) => {
        if (val !== 0) return 1.0;
        return 0;
      });
      const CuI = tf.linalg.diag(userRow);
      const Cu = CuI.add(YI);

      const yTCuIy = tf.transpose(Y).dot(CuI).dot(Y);
      const yTCuPu = tf.transpose(Y).dot(Cu).dot(tf.transpose(userPref));
      X[u] = tf.linalg.inv(yTy + yTCuIy + lI).matMul(yTCuPu);
    }

    for (let j = 0; j < jobSize; j += 1) {
      const jobRow = tf.transpose(confidence)[j];
      const jobPref = jobRow.map((val) => {
        if (val !== 0) return 1.0;
        return 0;
      });
      const CjI = tf.linalg.diag(jobRow);
      const Cj = CjI.add(XI);

      const xTCjIx = tf.transpose(X).dot(CjI).dot(X);
      const xTCjPj = tf.transpose(X).dot(Cj).dot(tf.transpose(jobPref));
      Y[j] = tf.linalg.inv(xTx + xTCjIx + lI).matMul(xTCjPj);
    }
  }
  return [X, Y];
}

function getSimilarJobs(jobId, jobVec, jobList) {
  const jobVector = tf.transpose(jobVec[jobId]);
  const scores = jobVec.dot(jobVector).arraySync();
  const top10 = scores.sort().reverse().slice(0, 10);

  const jobIds = [];
  const jobScores = [];

  for (let i = 0; i < 10; i += 1) {
    jobIds.push(jobList[])
  }
}

function getRecommendation(activities, vacId, userId) {
  const rawData = {
    user: [],
    jobId: [],
    views: [],
  };
  for (let i = 0; i < activities.length; i += 1) {
    rawData.user.push(activities[i].user_email);
    rawData.jobId.push(activities[i].vac_id);
    rawData.views.push(activities[i].views);
  }
  const userList = rawData.user.filter((v, i, a) => a.indexOf(v) === i);
  const jobList = rawData.user.filter((v, i, a) => a.indexOf(v) === i);
  const data = rawData.user.map((val, ind) => [userList.indexOf(val), jobList.indexOf(rawData.jobId[ind])]);

  const dataSparse = tf.sparse.SparseTensor(data, rawData.views, [userList.length, jobList.length]);
  const [userVec, jobVec] = implicitALS(dataSparse, 20, 20, 0.1, 40);

  const similar = getSimilarJobs(jobList.indexOf(vacId), jobVec, jobList);
}

module.exports.getRecommendation = getRecommendation;
