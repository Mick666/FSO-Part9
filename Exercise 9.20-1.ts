// App.ts

import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { Button, Divider, Header, Container } from "semantic-ui-react";

import { apiBaseUrl } from "./constants";
import { useStateValue } from "./state";
import { Patient, Diagnosis } from "./types";
import { setPatientList, setDiagnoses } from './state/reducer';

import PatientListPage from "./PatientListPage";
import PatientInfo from './components/PatientInfo';

const App: React.FC = () => {
  const [, dispatch] = useStateValue();
  React.useEffect(() => {
    axios.get<void>(`${apiBaseUrl}/ping`);

    const fetchPatientList = async () => {
      try {
        const { data: patientListFromApi } = await axios.get<Patient[]>(
          `${apiBaseUrl}/patients`
        );
        dispatch(setPatientList(patientListFromApi));
      } catch (e) {
        console.error(e);
      }
    };
    const fetchDiagnoses = async () => {
      try {
        const { data: diagnosesData } = await axios.get<Diagnosis[]>(
          `${apiBaseUrl}/diagnoses`
        );
        console.log(diagnosesData);
        dispatch(setDiagnoses(diagnosesData));
      } catch (e) {
        console.error(e);
      }
    };
    fetchPatientList();
    fetchDiagnoses();
  }, [dispatch]);

  return (
    <div className="App">
      <Router>
        <Container>
          <Header as="h1">Patientor</Header>
          <Button as={Link} to="/" primary>
            Home
          </Button>
          <Divider hidden />
          <Switch>
            <Route path="/patient/:id">
              <PatientInfo /> 
            </Route> 
            <Route path="/">
              <PatientListPage />
            </Route>
          </Switch>
        </Container>
      </Router>
    </div>
  );
};

export default App;

// state/state.tsx

import React, { createContext, useContext, useReducer } from "react";
import { Patient, DetailedPatientInfo, Diagnosis } from "../types";

import { Action } from "./reducer";

export type State = {
  patients: { [id: string]: Patient };
  patientInfo: { [id: string]: DetailedPatientInfo };
  diagnoses: { [id: string]: Diagnosis };
};

const initialState: State = {
  patients: {},
  patientInfo: {},
  diagnoses: {}
};

export const StateContext = createContext<[State, React.Dispatch<Action>]>([
  initialState,
  () => initialState
]);

type StateProviderProps = {
  reducer: React.Reducer<State, Action>;
  children: React.ReactElement;
};

export const StateProvider: React.FC<StateProviderProps> = ({
  reducer,
  children
}: StateProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={[state, dispatch]}>
      {children}
    </StateContext.Provider>
  );
};
export const useStateValue = () => useContext(StateContext);

// state/reducer.ts

import { State } from "./state";
import { Patient, DetailedPatientInfo, Diagnosis } from "../types";

export type Action =
  | {
    type: "SET_PATIENT_LIST";
    payload: Patient[];
  }
  | {
    type: "ADD_PATIENT";
    payload: Patient;
  }
  | {
    type: "ADD_DETAILED_INFO";
    payload: DetailedPatientInfo;
  }
  | {
    type: "ADD_DIAGNOSES";
    payload: Diagnosis[];
  };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PATIENT_LIST":
      return {
        ...state,
        patients: {
          ...action.payload.reduce(
            (memo, patient) => ({ ...memo, [patient.id]: patient }),
            {}
          ),
          ...state.patients
        }
      };
    case "ADD_PATIENT":
      return {
        ...state,
        patients: {
          ...state.patients,
          [action.payload.id]: action.payload
        }
      };
    case "ADD_DETAILED_INFO":
      return {
        ...state,
        patientInfo: {
          ...state.patientInfo,
          [action.payload.id]: action.payload
        }
      };
    case "ADD_DIAGNOSES":
        return {
          ...state,
          diagnoses: {
            ...action.payload.reduce(
              (memo, diagnosis) => ({ ...memo, [diagnosis.code]: diagnosis }),
              {}
            ),
            ...state.diagnoses
          }
        };
    default:
      return state;
  }
};


export const setPatientList = (payload: Patient[]): Action => {
  return {
    type: "SET_PATIENT_LIST",
    payload: payload
  };
};

export const addPatient = (payload: Patient): Action => {
  return {
    type: "ADD_PATIENT",
    payload: payload
  };
};

export const addDetailedInfo = (payload: DetailedPatientInfo): Action => {
  return {
    type: "ADD_DETAILED_INFO",
    payload: payload
  };
};

export const setDiagnoses = (payload: Diagnosis[]): Action => {
  return {
    type: "ADD_DIAGNOSES",
    payload: payload
  };
};

// src/components/PatientInfo.tsx

import React from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { Icon, Segment } from 'semantic-ui-react';
import { apiBaseUrl } from "../constants";
import {
  DetailedPatientInfo, Entry, Gender, GenderIcon,
  HealthCheckEntry, HospitalEntry, OccupationalHealthcareEntry, HeartColor
} from '../types';

import { useStateValue } from "../state";
import { addDetailedInfo } from '../state/reducer';

const getGenderIcon = (patientGender: Gender): GenderIcon => {
  switch (patientGender) {
    case 'male':
      return 'mars';
    case 'female':
      return 'venus';
    case 'other':
      return 'genderless';
    default:
      return undefined;
  }
};

const PatientInfoTable = (entry: Entry) => {
  const [{ diagnoses },] = useStateValue();
  return (
    <div>
      <h3 >{entry.date}</h3> 
      <i>{entry.description}</i> <br />
      <ul>
        {entry.diagnosisCodes?.map(code => {
          return (
            <li>{code} {diagnoses[code].name}</li>
          );
        })}
      </ul>
    </div>
  );
};

const PatientInfo: React.FC = () => {
  const [{ patientInfo }, dispatch] = useStateValue();
  const { id } = useParams<{ id: string }>();

  const fetchPatientInfo = async () => {
    try {
      const { data: detailedPatientInfo } = await axios.get<DetailedPatientInfo>(
        `${apiBaseUrl}/patients/${id}`
      );
      dispatch(addDetailedInfo(detailedPatientInfo));
    } catch (e) {
      console.error(e);
    }
  };

  if (!patientInfo[id]) {
    fetchPatientInfo();
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <h2>{patientInfo[id].name}</h2>
        <Icon
          name={getGenderIcon(patientInfo[id].gender)}
          size='large'
        />
      </div>
      <p>Occupation: {patientInfo[id].occupation}</p>
      <p>{patientInfo[id].dateOfBirth ? `DoB: ${patientInfo[id].dateOfBirth}` : ''}</p>
      <p>{patientInfo[id].ssn ? `SSN: ${patientInfo[id].ssn}` : ''}</p>
      <h4>Entries:</h4>
      {patientInfo[id].entries.map(entry => PatientInfoTable(entry))}
    </div>
  );
};

export default PatientInfo;
