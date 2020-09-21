/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { useContext } from 'react';
import {
  TextInput, Button, Text, Linking, View, SafeAreaView, TouchableOpacity, ScrollView,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import * as Animatable from 'react-native-animatable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles from './cssStylesheet';
import AuthContext from './AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
const { host } = require('./host');

export default class LabourLoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      vacanciesFound: [],
      vacanciesFoundNum: [],
      vacancyDetails: null,
    };
    this.applyForJob = this.applyForJob.bind(this);
  }
  static contextType = AuthContext;

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { token, user, vacancyDetails } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/viewJobsLabour`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType: 'labour',
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const vacancyNum = json.vacancyDetails.map(() => uuid.v4());
        this.setState({ loading: false, vacanciesFoundNum: vacancyNum, vacanciesFound: json.vacancyDetails, vacancyDetails: vacancyDetails ? vacancyDetails : null });
      } else {
        this.setState({ loading: false, vacanciesFound: json.vacancyDetails, vacancyDetails: vacancyDetails ? vacancyDetails : null });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  // componentWillReceiveProps() {
  //   const { route, navigation } = { ...this.props };
  //   const { token, user } = route.params;
  //   const { signOut } = this.context;
  //   fetch(`${host}/users/viewJobsLabour`, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: token,
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       user,
  //       userType: 'labour',
  //     }),
  //   }).then((res) => res.json()).then((json) => {
  //     if (json.success) {
  //       const vacancyNum = json.vacancyDetails.map(() => uuid.v4());
  //       this.setState({ loading: false, vacanciesFoundNum: vacancyNum, vacanciesFound: json.vacancyDetails });
  //     } else {
  //       this.setState({ loading: false, vacanciesFound: json.vacancyDetails, error: 'No matching Jobs Found' });
  //     }
  //   }, () => {
  //     SecureStore.deleteItemAsync('authToken');
  //     signOut({ error: 'Unauthorized User' });
  //   });
  // }

  applyForJob(value) {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/applyforJob`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        vacancyId: value.vac_id,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.push('LabourLoggedIn', {
                ...route.params, error: null,
              });
            } else {
              navigation.push('Home', {
                user, token, error: null,
              });
            } 
          });
        }
      } else {
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.push('LabourLoggedIn', {
                ...route.params, error: json.msg,
              });
            } else {
              navigation.push('Home', {
                user, token, error: json.msg,
              });
            } 
          });
        }
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  withdrawApplicationHandler(value) {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/withdrawJob`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        vacancyId: value.vac_id,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        console.log('success');
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.push('LabourLoggedIn', {
                ...route.params, error: null,
              });
            } else {
              navigation.push('Home', {
                user, token, error: null,
              });
            } 
          });
        }
      } else {
        console.log('success: false');
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.push('LabourLoggedIn', {
                ...route.params, error: json.msg,
              });
            } else {
              navigation.push('Home', {
                user, token, error: json.msg,
              });
            } 
          });
        }
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  viewJobDesc(value) {
    const { vacanciesFound } = { ...this.state };
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/viewJobDetail`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        vacancyId: value.vac_id,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.push('LabourLoggedIn', {
                ...route.params, error: null, vacancyDetails: value,
              });
            } else {
              navigation.push('Home', {
                user, token, error: null, vacancyDetails: value,
              });
            } 
          });
        }
      } else {
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.push('LabourLoggedIn', {
                ...route.params, error: json.msg, vacancyDetails: value,
              });
            } else {
              navigation.push('Home', {
                user, token, error: json.msg, vacancyDetails: value,
              });
            } 
          });
        }
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }


  render() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, details, token, userDetails, skillList, error,
    } = route.params;
    const {
      loading, vacanciesFound, vacanciesFoundNum, vacancyDetails,
    } = { ...this.state };
    const { signOut } = this.context;
    return (
      <ScreenContainer style={{
        ...styles.container,
        // justifyContent: 'center',
        alignItems: 'center',
      }}
      >
        {error && (
          <Text>{error}</Text>
        )}
        {loading && (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 200, marginHorizontal: 100 }}>
            <Text style={{fontSize: 18, fontWeight: '200' }}>Retrieving Your Eligible Vacancies...</Text>
          </View>
        )}
        {/* {!loading && vacanciesFoundNum.length <=0 && vacanciesFound.length <=0 && (
          <Text> No vacancies found for your skills</Text>
        )} */}
        <ScrollView>
        {!loading && !vacanciesFound && !vacancyDetails && (
          <Text>No matching Jobs Found</Text>
        )}
        {!loading && vacanciesFoundNum && vacanciesFound && !vacancyDetails && vacanciesFound.map((val, ind) => {
          const {
            job_desc, vacancy, vac_name, village, city, state, skills, vac_id, applied,
          } = { ...val };
          return (
            <View key={vacanciesFound.vac_id} style={styles.vacancyCard}>
              <View style={{ borderBottomWidth: 1, marginVertical: 5, marginHorizontal: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, opacity: 0.8, paddingHorizontal: 20 }}>{vac_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Description: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5, flexWrap: 'wrap', numberOfLines: 1 }}>{job_desc}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Skills Required: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5, flexWrap: 'wrap' }}>{skills.join(', ')}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>No. of Vacancies: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{vacancy}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5, flexWrap: 'wrap' }}>{village}, {city}, {state}</Text>
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    this.viewJobDesc(val);
                  }}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  disabled={applied ? true : false}
                  onPress={() => {
                    !applied ? this.applyForJob(vac_id) : null;
                  }}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={applied ? ['#999999', '#777777'] : ['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>{applied ? 'Applied' : 'Apply'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {applied && (
                <TouchableOpacity
                  onPress={() => this.withdrawApplicationHandler(vac_id)}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>Withdraw Application</Text>
                  </LinearGradient>
                </TouchableOpacity>
                )} */}
              </View>
            </View>
          );
        })}
        {!loading && vacanciesFoundNum && vacanciesFound && vacancyDetails && (
          <View key={vacancyDetails.vac_id} style={styles.vacancyCard}>
            <View style={{ borderBottomWidth: 1, marginVertical: 5, marginHorizontal: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 22, opacity: 0.8, paddingHorizontal: 20 }}>{vacancyDetails.vac_name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Description: </Text>
              <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5, flexWrap: 'wrap' }}>{vacancyDetails.job_desc}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Skills Required: </Text>
              <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5, flexWrap: 'wrap' }}>{vacancyDetails.skills.join(', ')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>No. of Vacancies: </Text>
              <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{vacancyDetails.vacancy}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
              <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5, flexWrap: 'wrap' }}>{vacancyDetails.village}, {vacancyDetails.city}, {vacancyDetails.state}</Text>
            </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                  onPress={() => {
                    this.setState({ vacancyDetails: null });
                  }}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>Back</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={vacancyDetails.applied ? true : false}
                  onPress={() => {
                    !vacancyDetails.applied ? this.applyForJob(vacancyDetails) : null;
                  }}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={vacancyDetails.applied ? ['#999999', '#777777'] : ['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>{vacanciesFound.applied ? 'Applied' : 'Apply'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {vacancyDetails.applied && (
                <TouchableOpacity
                  onPress={() => this.withdrawApplicationHandler(vacancyDetails)}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>Withdraw Application</Text>
                  </LinearGradient>
                </TouchableOpacity>
            )}
            </View>
          </View>
        )}
        </ScrollView>
      </ScreenContainer>
    );
  }
}
