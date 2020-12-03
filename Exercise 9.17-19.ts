// src/App.ts

import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { Button, Divider, Header, Container } from "semantic-ui-react";

import { apiBaseUrl } from "./constants";
import { useStateValue } from "./state";
import { Patient } from "./types";
import { setPatientList } from './state/reducer';

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
    fetchPatientList();
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

// src/PatientListPage

import React from "react";
import axios from "axios";
import { Container, Table, Button } from "semantic-ui-react";
import { Link } from 'react-router-dom';

import { PatientFormValues } from "../AddPatientModal/AddPatientForm";
import AddPatientModal from "../AddPatientModal";
import { Patient } from "../types";
import { apiBaseUrl } from "../constants";
import HealthRatingBar from "../components/HealthRatingBar";
import { useStateValue } from "../state";
import { addPatient } from '../state/reducer';

const PatientListPage: React.FC = () => {
  const [{ patients }, dispatch] = useStateValue();

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const openModal = (): void => setModalOpen(true);

  const closeModal = (): void => {
    setModalOpen(false);
    setError(undefined);
  };

  const submitNewPatient = async (values: PatientFormValues) => {
    try {
      const { data: newPatient } = await axios.post<Patient>(
        `${apiBaseUrl}/patients`,
        values
      );
      dispatch(addPatient(newPatient));
      closeModal();
    } catch (e) {
      console.error(e.response.data);
      setError(e.response.data.error);
    }
  };

  return (
    <div className="App">
      <Container textAlign="center">
        <h3>Patient list</h3>
      </Container>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Gender</Table.HeaderCell>
            <Table.HeaderCell>Occupation</Table.HeaderCell>
            <Table.HeaderCell>Health Rating</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.values(patients).map((patient: Patient) => (
            <Table.Row key={patient.id}>
              <Table.Cell><Link to={`/patient/${patient.id}`}>{patient.name}</Link></Table.Cell>
              <Table.Cell>{patient.gender}</Table.Cell>
              <Table.Cell>{patient.occupation}</Table.Cell>
              <Table.Cell>
                <HealthRatingBar showText={false} rating={1} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <AddPatientModal
        modalOpen={modalOpen}
        onSubmit={submitNewPatient}
        error={error}
        onClose={closeModal}
      />
      <Button onClick={() => openModal()}>Add New Patient</Button>
    </div>
  );
};

export default PatientListPage;

// src/components/PatientInfo.ts

import React from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import { apiBaseUrl } from "../constants";
import { DetailedPatientInfo } from '../types';

import { useStateValue } from "../state";
import { addDetailedInfo } from '../state/reducer';


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
          <div style={{display: 'flex'}}>
            <h2>{patientInfo[id].name}</h2> 
            <Icon
              name={patientInfo[id].gender === 'male' ? 'mars' :
              patientInfo[id].gender === 'female' ? 'venus' : 'genderless'}
              size='large'
            />
          </div>
            <p>Occupation: {patientInfo[id].occupation}</p>
            <p>{patientInfo[id].dateOfBirth ? `DoB: ${patientInfo[id].dateOfBirth}` : ''}</p>
            <p>{patientInfo[id].ssn ? `SSN: ${patientInfo[id].ssn}` : ''}</p>
        </div>
    );
};

export default PatientInfo;

//src/state/reducer

import { State } from "./state";
import { Patient, DetailedPatientInfo } from "../types";
import { log } from "console";

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

// src/state/state.ts

import React, { createContext, useContext, useReducer } from "react";
import { Patient, DetailedPatientInfo } from "../types";

import { Action } from "./reducer";

export type State = {
  patients: { [id: string]: Patient };
  patientInfo: { [id: string]: DetailedPatientInfo };
};

const initialState: State = {
  patients: {},
  patientInfo: {}
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


// src/types.ts

export interface Diagnosis {
    code: string;
    name: string;
    latin?: string;
  }
  
  export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other"
  }
  
  export interface Patient {
    id: string;
    name: string;
    occupation: string;
    gender: Gender;
    ssn?: string;
    dateOfBirth?: string;
  }
  
  export interface DetailedPatientInfo {
    id: string;
    name: string;
    occupation: string;
    gender: Gender;
    ssn?: string;
    dateOfBirth?: string;
    entries?: [];
  }
  

