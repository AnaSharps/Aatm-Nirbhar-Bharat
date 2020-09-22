import random
import pandas as pd
import numpy as np

import scipy.sparse as sparse
from scipy.sparse.linalg import spsolve
from sklearn.preprocessing import MinMaxScaler

raw_data = pd.read_table('data/activities.tsv')
raw_data.columns = ['user', 'job', 'views']

data = raw_data.dropna()

data['user_id'] = data['user'].astype("category").cat.codes
data['job_id'] = data['job'].astype("category").cat.codes

item_lookup = data[['job_id', 'job']].drop_duplicates()
item_lookup['job_id'] = item_lookup.job_id.astype(str)

data = data.drop(['user', 'job'], axis=1)

data = data.loc[data.views != 0]

users = list(np.sort(data.user_id.unique()))
jobs = list(np.sort(data.job_id.unique()))
views = list(data.views)

rows = data.user_id.astype(int)
cols = data.job_id.astype(int)

data_sparse = sparse.csr_matrix((views, (rows, cols)), shape=(len(users), len(jobs)))

def implicit_als(sparse_data, alpha_val=40, iterations=10, lambda_val=0.1, features=10):

  confidence = sparse_data * alpha_val

  user_size, job_size = sparse_data.shape
  
  X = sparse.csr_matrix(np.random.normal(size = (user_size, features)))
  Y = sparse.csr_matrix(np.random.normal(size = (job_size, features)))
  
  X_I = sparse.eye(user_size)
  Y_I = sparse.eye(job_size)
  
  I = sparse.eye(features)
  lI = lambda_val * I

  for i in range(iterations):
      print('iteration %d of %d' % (i+1, iterations))
      
      yTy = Y.T.dot(Y)
      xTx = X.T.dot(X)

      for u in range(user_size):

          u_row = confidence[u,:].toarray() 

          p_u = u_row.copy()
          p_u[p_u != 0] = 1.0

          CuI = sparse.diags(u_row, [0])
          Cu = CuI + Y_I

          yT_CuI_y = Y.T.dot(CuI).dot(Y)
          yT_Cu_pu = Y.T.dot(Cu).dot(p_u.T)
          X[u] = spsolve(yTy + yT_CuI_y + lI, yT_Cu_pu)

    
      for i in range(job_size):
    
        i_row = confidence[:,i].T.toarray()

        p_i = i_row.copy()
        p_i[p_i != 0] = 1.0

        CiI = sparse.diags(i_row, [0])
        Ci = CiI + X_I

        xT_CiI_x = X.T.dot(CiI).dot(X)
        xT_Ci_pi = X.T.dot(Ci).dot(p_i.T)
        Y[i] = spsolve(xTx + xT_CiI_x + lI, xT_Ci_pi)

  sparse.save_npz("users.npz", X, compressed=True)
  sparse.save_npz("jobs.npz", Y, compressed=True)
  return X, Y

user_vecs, job_vecs = implicit_als(data_sparse, iterations=20, features=20, alpha_val=40)


def recommend(user_id, data_sparse, user_vecs, job_vecs, item_lookup, num_items=10):
  user_interactions = data_sparse[user_id,:].toarray()

  user_interactions = user_interactions.reshape(-1) + 1
  user_interactions[user_interactions > 1] = 0

  rec_vector = user_vecs[user_id,:].dot(job_vecs.T).toarray()

  min_max = MinMaxScaler()
  rec_vector_scaled = min_max.fit_transform(rec_vector.reshape(-1,1))[:,0]
  recommend_vector = user_interactions*rec_vector_scaled
 
  job_idx = np.argsort(recommend_vector)[::-1][:num_items]

  jobs = []
  scores = []

  for idx in job_idx:
    jobs.append(item_lookup.job.loc[item_lookup.job_id == str(idx)].iloc[0])
    scores.append(recommend_vector[idx])

  recommendations = pd.DataFrame({'job': jobs, 'score': scores})
    
  return recommendations

recommendations = recommend(0, data_sparse, user_vecs, job_vecs, item_lookup)
print(recommendations)