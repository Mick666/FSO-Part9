// src/components/PatientInfo.tsx

import React from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { Icon, Segment, Button } from 'semantic-ui-react';
import { apiBaseUrl } from "../constants";
import {
  DetailedPatientInfo, Entry, Gender, GenderIcon,
  HealthCheckEntry, HospitalEntry, OccupationalHealthcareEntry, HeartColor, NewEntry
} from '../types';
import AddHealthCheckModal from './EntryForms/AddHealthCheckEntry';
import AddHospitalEntryModal from './EntryForms/AddHospitalEntry';
import AddOccupationalHealthEntryModal from './EntryForms/AddOccupationalHealthEntry';

import { useStateValue } from "../state";
import { addDetailedInfo, addEntry } from '../state/reducer';

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

const getHeartColor = (rating: number): HeartColor => {
  switch (rating) {
    case 0:
      return "green";
    case 1:
      return "yellow";
    case 2:
      return "orange";
    case 3:
      return "red";
    default:
      return undefined;
  }
};

const HospitalEntryTable: React.FC<{ entry: HospitalEntry }> = ({ entry }) => {
  const [{ diagnoses },] = useStateValue();
  return (
    <Segment>
      <div style={{ display: "flex" }}><h3 style={{ paddingRight: "5px" }}>{entry.date}</h3> <Icon name='doctor' size="large" /></div>
      Doctor: {entry.specialist} <br />
      <i>{entry.description}</i> <br />
      <i>{`Discharged: ${entry.discharge.date}, ${entry.discharge.criteria}`}</i> <br />
      <ul>
        {entry.diagnosisCodes?.map((code, index) => {
          if (!diagnoses[code]) return <div>Loading...</div>;
          return (
            <li key={index}>{code} {diagnoses[code].name}</li>
          );
        })}
      </ul>
    </Segment>
  );
};

const HealthCheckTable: React.FC<{ entry: HealthCheckEntry }> = ({ entry }) => {
  return (
    <Segment>
      <div style={{ display: "flex" }}><h3 style={{ paddingRight: "5px" }}>{entry.date}</h3> <Icon name='stethoscope' size="large" /></div>
      Doctor: {entry.specialist} <br />
      <i>{entry.description}</i> <br />
      <Icon name='heart' color={getHeartColor(entry.healthCheckRating)} />
    </Segment>
  );
};


const OccupationalHealthcareTable: React.FC<{ entry: OccupationalHealthcareEntry }> = ({ entry }) => {
  return (
    <Segment>
      <div style={{ display: "flex" }}><h3 style={{ paddingRight: "5px" }}>{entry.date}</h3> <Icon name='industry' size="large" /></div>
      Doctor: {entry.specialist} <br />
      Employer: {entry.employerName} <br />
      <i>{entry.description}</i> <br />
      {entry.sickLeave ? `Sick leave: ${entry.sickLeave?.startDate}:${entry.sickLeave?.endDate}` : null}
    </Segment>
  );
};

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled type: ${JSON.stringify(value)}`
  );
};

const EntryDetails = (entry: Entry) => {
  switch (entry.type) {
    case "Hospital":
      return <HospitalEntryTable entry={entry} />;
    case "HealthCheck":
      return <HealthCheckTable entry={entry} />;
    case "OccupationalHealthcare":
      return <OccupationalHealthcareTable entry={entry} />;
    default:
      return assertNever(entry);
  }
};

const PatientInfo: React.FC = () => {
  const [{ patientInfo }, dispatch] = useStateValue();
  const { id } = useParams<{ id: string }>();

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [modalHospitalEntry, setModalHospitalOpen] = React.useState<boolean>(false);
  const [modalOccHealthEntry, setModalOccHealthOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const openModal = (modalFunc: Function): void => modalFunc(true);

  const closeModals = (): void => {
    setModalOpen(false);
    setModalHospitalOpen(false);
    setModalOccHealthOpen(false);
    setError(undefined);
  };

  const submitNewEntry = async (values: NewEntry) => {
    try {
      const newEntryValues = values;
      if (newEntryValues.diagnosisCodes?.every(x => x === '')) delete newEntryValues.diagnosisCodes;
      const { data: newEntry } = await axios.post<Entry>(
        `${apiBaseUrl}/patients/${id}/entries`,
        newEntryValues
      );
      const updatedPatient = patientInfo[id];
      updatedPatient.entries.push(newEntry);
      dispatch(addEntry(updatedPatient));
      closeModals();
    } catch (e) {
      console.error(e.response.data);
      setError(e.response.data.error);
    }
  };

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
      {patientInfo[id].entries.map(entry => EntryDetails(entry))}
      <AddHealthCheckModal
        modalOpen={modalOpen}
        onSubmit={submitNewEntry}
        error={error}
        onClose={closeModals}
      />
      <Button onClick={() => openModal(setModalOpen)}>Add New Health Check Entry</Button>
      <AddHospitalEntryModal
        modalOpen={modalHospitalEntry}
        onSubmit={submitNewEntry}
        error={error}
        onClose={closeModals}
      />
      <Button onClick={() => openModal(setModalOccHealthOpen)}>Add New Hospital Entry</Button> <br />
      <AddOccupationalHealthEntryModal
        modalOpen={modalOccHealthEntry}
        onSubmit={submitNewEntry}
        error={error}
        onClose={closeModals}
      />
      <Button onClick={() => openModal(setModalOccHealthOpen)}>Add New Occupational Health Check Entry</Button>
    </div>
  );
};

export default PatientInfo;

// src/components/EntryForms/AddHealthCheckEntry.tsx

import React from "react";
import { Grid, Button } from "semantic-ui-react";
import { Field, Formik, Form } from "formik";
import { TextField, DiagnosisSelection, NumberField } from "../../AddPatientModal/FormField";
import { HealthCheckRating, NewEntry } from '../../types';
import { useStateValue } from "../../state";
import { Modal, Segment } from 'semantic-ui-react';

interface Props {
    onSubmit: (values: NewEntry) => void;
    onCancel: () => void;
}


export const AddHealthCheckEntry: React.FC<Props> = ({ onSubmit, onCancel }) => {
    const [{ diagnoses },] = useStateValue();

    return (
        <Formik
            initialValues={{
                date: "",
                description: "",
                specialist: "",
                diagnosisCodes: [""],
                healthCheckRating: HealthCheckRating.Healthy,
                type: "HealthCheck"
            }}
            onSubmit={onSubmit}
            validate={values => {
                const requiredError = "Field is required";
                const errors: { [field: string]: string } = {};
                if (!values.date) {
                    errors.date = requiredError;
                }
                if (!values.description) {
                    errors.description = requiredError;
                }
                if (!values.specialist) {
                    errors.specialist = requiredError;
                }
                if (!values.diagnosisCodes) {
                    errors.diagnosisCodes = requiredError;
                }
                return errors;
            }}
        >
            {({ isValid, dirty, setFieldValue, setFieldTouched }) => {
                return (
                    <Form className="form ui">
                        <Field
                            label="Date"
                            placeholder="Date"
                            name="date"
                            component={TextField}
                        />
                        <Field
                            label="Description"
                            placeholder="Description"
                            name="description"
                            component={TextField}
                        />
                        <Field
                            label="Specialist"
                            placeholder="Specialist"
                            name="specialist"
                            component={TextField}
                        />
                        <Field
                            label="healthCheckRating"
                            name="healthCheckRating"
                            component={NumberField}
                            min={0}
                            max={3}
                        />
                        <DiagnosisSelection
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                        diagnoses={Object.values(diagnoses)}
                        />    
                        <Grid>
                            <Grid.Column floated="left" width={5}>
                                <Button type="button" onClick={onCancel} color="red">
                                    Cancel
                  </Button>
                            </Grid.Column>
                            <Grid.Column floated="right" width={5}>
                                <Button
                                    type="submit"
                                    floated="right"
                                    color="green"
                                    disabled={!dirty || !isValid}
                                >
                                    Add
                  </Button>
                            </Grid.Column>
                        </Grid>
                    </Form>
                );
            }}
        </Formik>
    );
};


interface ModalProps {
  modalOpen: boolean;
  onClose: () => void;
  onSubmit: (values: NewEntry) => void;
  error?: string;
}

const AddHealthCheckModal = ({ modalOpen, onClose, onSubmit, error }: ModalProps) => (
  <Modal open={modalOpen} onClose={onClose} centered={false} closeIcon>
    <Modal.Header>Add a new health check entry</Modal.Header>
    <Modal.Content>
      {error && <Segment inverted color="red">{`Error: ${error}`}</Segment>}
      <AddHealthCheckEntry onSubmit={onSubmit} onCancel={onClose} />
    </Modal.Content>
  </Modal>
);

export default AddHealthCheckModal;

// src/components/EntryForms/AddHospitalEntry.tsx

import React from "react";
import { Grid, Button } from "semantic-ui-react";
import { Field, Formik, Form } from "formik";
import { TextField, DiagnosisSelection } from "../../AddPatientModal/FormField";
import { NewHospitalEntry } from '../../types';
import { useStateValue } from "../../state";
import { Modal, Segment } from 'semantic-ui-react';

interface Props {
    onSubmit: (values: NewHospitalEntry) => void;
    onCancel: () => void;
}


export const AddHospitalEntry: React.FC<Props> = ({ onSubmit, onCancel }) => {
    const [{ diagnoses },] = useStateValue();

    return (
        <Formik
            initialValues={{
                date: "",
                description: "",
                specialist: "",
                diagnosisCodes: [""],
                discharge: { date: "", criteria: "" },
                type: "Hospital"
            }}
            onSubmit={onSubmit}
            validate={values => {
                const requiredError = "Field is required";
                const errors: { [field: string]: string } = {};
                if (!values.date) {
                    errors.date = requiredError;
                }
                if (!values.description) {
                    errors.description = requiredError;
                }
                if (!values.specialist) {
                    errors.specialist = requiredError;
                }
                if (!values.diagnosisCodes) {
                    errors.diagnosisCodes = requiredError;
                }
                if (!values.discharge.date || !values.discharge.criteria) {
                    errors.discharge = requiredError;
                }
                return errors;
            }}
        >
            {({ isValid, dirty, setFieldValue, setFieldTouched }) => {
                return (
                    <Form className="form ui">
                        <Field
                            label="Date"
                            placeholder="Date"
                            name="date"
                            component={TextField}
                        />
                        <Field
                            label="Description"
                            placeholder="Description"
                            name="description"
                            component={TextField}
                        />
                        <Field
                            label="Specialist"
                            placeholder="Specialist"
                            name="specialist"
                            component={TextField}
                        />
                        <Field
                            label="Discharge Date"
                            placeholder="Discharge Date"
                            name="discharge.date"
                            component={TextField}
                        />
                        <Field
                            label="Discharge Criteria"
                            placeholder="Discharge Criteria"
                            name="discharge.criteria"
                            component={TextField}
                        />
                        <DiagnosisSelection
                            setFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            diagnoses={Object.values(diagnoses)}
                        />
                        <Grid>
                            <Grid.Column floated="left" width={5}>
                                <Button type="button" onClick={onCancel} color="red">
                                    Cancel
                                </Button>
                            </Grid.Column>
                            <Grid.Column floated="right" width={5}>
                                <Button
                                    type="submit"
                                    floated="right"
                                    color="green"
                                    disabled={!dirty || !isValid}
                                >
                                    Add
                                </Button>
                            </Grid.Column>
                        </Grid>
                    </Form>
                );
            }}
        </Formik>
    );
};


interface ModalProps {
    modalOpen: boolean;
    onClose: () => void;
    onSubmit: (values: NewHospitalEntry) => void;
    error?: string;
}

const AddHospitalEntryModal = ({ modalOpen, onClose, onSubmit, error }: ModalProps) => (
    <Modal open={modalOpen} onClose={onClose} centered={false} closeIcon>
        <Modal.Header>Add a new hospital entry</Modal.Header>
        <Modal.Content>
            {error && <Segment inverted color="red">{`Error: ${error}`}</Segment>}
            <AddHospitalEntry onSubmit={onSubmit} onCancel={onClose} />
        </Modal.Content>
    </Modal>
);

export default AddHospitalEntryModal;

// src/components/EntryForms/AddOccupationalHealthEntry.tsx

import React from "react";
import { Grid, Button } from "semantic-ui-react";
import { Field, Formik, Form } from "formik";
import { TextField, DiagnosisSelection } from "../../AddPatientModal/FormField";
import { NewOcccupationalHealthcareEntry } from '../../types';
import { useStateValue } from "../../state";
import { Modal, Segment } from 'semantic-ui-react';

interface Props {
    onSubmit: (values: NewOcccupationalHealthcareEntry) => void;
    onCancel: () => void;
}


export const AddOccupationalHealthEntry: React.FC<Props> = ({ onSubmit, onCancel }) => {
    const [{ diagnoses },] = useStateValue();

    const submitForm = (entryData: NewOcccupationalHealthcareEntry): void => {
        const newEntryValues = entryData;
        if (newEntryValues.sickLeave?.startDate === '' &&  newEntryValues.sickLeave?.endDate === '') delete newEntryValues.sickLeave;
        onSubmit(newEntryValues);
    };

    return (
        <Formik
            initialValues={{
                date: "",
                description: "",
                specialist: "",
                diagnosisCodes: [""],
                employerName: "",
                sickLeave: { startDate: "", endDate: "" },
                type: "OccupationalHealthcare"
            }}
            onSubmit={submitForm}
            validate={values => {
                const requiredError = "Field is required";
                const errors: { [field: string]: string } = {};
                if (!values.date) {
                    errors.date = requiredError;
                }
                if (!values.description) {
                    errors.description = requiredError;
                }
                if (!values.specialist) {
                    errors.specialist = requiredError;
                }
                if (!values.diagnosisCodes) {
                    errors.diagnosisCodes = requiredError;
                }
                if ((!values?.sickLeave?.startDate && values?.sickLeave?.endDate) || (values?.sickLeave?.startDate && !values?.sickLeave?.endDate)) {
                    errors.sickLeave = requiredError;
                }
                return errors;
            }}
        >
            {({ isValid, dirty, setFieldValue, setFieldTouched }) => {
                return (
                    <Form className="form ui">
                        <Field
                            label="Date"
                            placeholder="Date"
                            name="date"
                            component={TextField}
                        />
                        <Field
                            label="Description"
                            placeholder="Description"
                            name="description"
                            component={TextField}
                        />
                        <Field
                            label="Specialist"
                            placeholder="Specialist"
                            name="specialist"
                            component={TextField}
                        />
                        <Field
                            label="Employer Name"
                            placeholder="Employer Name"
                            name="employerName"
                            component={TextField}
                        />
                        <Field
                            label="Sick Leave Start Date"
                            placeholder="Sick Leave Start Date"
                            name="sickLeave.startDate"
                            component={TextField}
                        />
                        <Field
                            label="Sick Leave End Date"
                            placeholder="Sick Leave End Date"
                            name="sickLeave.endDate"
                            component={TextField}
                        />
                        <DiagnosisSelection
                            setFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            diagnoses={Object.values(diagnoses)}
                        />
                        <Grid>
                            <Grid.Column floated="left" width={5}>
                                <Button type="button" onClick={onCancel} color="red">
                                    Cancel
                                </Button>
                            </Grid.Column>
                            <Grid.Column floated="right" width={5}>
                                <Button
                                    type="submit"
                                    floated="right"
                                    color="green"
                                    disabled={!dirty || !isValid}
                                >
                                    Add
                                </Button>
                            </Grid.Column>
                        </Grid>
                    </Form>
                );
            }}
        </Formik>
    );
};


interface ModalProps {
    modalOpen: boolean;
    onClose: () => void;
    onSubmit: (values: NewOcccupationalHealthcareEntry) => void;
    error?: string;
}

const AddOccupationalHealthEntryModal = ({ modalOpen, onClose, onSubmit, error }: ModalProps) => (
    <Modal open={modalOpen} onClose={onClose} centered={false} closeIcon>
        <Modal.Header>Add a new hospital entry</Modal.Header>
        <Modal.Content>
            {error && <Segment inverted color="red">{`Error: ${error}`}</Segment>}
            <AddOccupationalHealthEntry onSubmit={onSubmit} onCancel={onClose} />
        </Modal.Content>
    </Modal>
);

export default AddOccupationalHealthEntryModal;

//src/types.ts

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
  
  export type GenderIcon = 'mars' | 'venus' | 'genderless' | undefined;
  
  export type HeartColor = 'green' | 'yellow' | 'orange' | 'red' | undefined;
  
  export type NewEntry = 
      | Omit<HospitalEntry, 'id'> 
      | Omit<OccupationalHealthcareEntry, 'id'>  
      | Omit<HealthCheckEntry, 'id'> ;
  
  export type NewHospitalEntry = Omit<HospitalEntry, 'id'> ;
  export type NewOcccupationalHealthcareEntry = Omit<OccupationalHealthcareEntry, 'id'> ;
  
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
    entries: Entry[];
  }
  
  export type Entry =
    | HospitalEntry
    | OccupationalHealthcareEntry
    | HealthCheckEntry;
  
  interface BaseEntry {
      id: string;
      description: string;
      date: string;
      specialist: string;
      diagnosisCodes?: Array<Diagnosis['code']>;
  }
  
  export enum HealthCheckRating {
      "Healthy" = 0,
      "LowRisk" = 1,
      "HighRisk" = 2,
      "CriticalRisk" = 3
  }
  
  export interface HealthCheckEntry extends BaseEntry {
      type: "HealthCheck";
      healthCheckRating: HealthCheckRating;
  }
  
  export interface HospitalEntry extends BaseEntry {
      type: "Hospital";
      discharge: Discharge;
  }
  
  interface Discharge {
      date: string;
      criteria: string;
  }
  
  export interface OccupationalHealthcareEntry extends BaseEntry {
      type: "OccupationalHealthcare";
      employerName: string;
      sickLeave?: SickLeave;
  }
  
  interface SickLeave {
      startDate: string;
      endDate: string;
  }
  