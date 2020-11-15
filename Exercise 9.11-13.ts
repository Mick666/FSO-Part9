// src/index.ts

import express from 'express';
import cors from 'cors';
import diagnosisRouter from './routes/diagnosis';
import patientRouter from './routes/patients';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3001;

app.get('/api/ping', (_req, res) => {
  res.send('pong');
});

app.use('/api/diagnoses', diagnosisRouter);

app.use('/api/patients', patientRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// data/patients.ts

import { PatientEntry } from '../src/types';
import toNewPatientEntry from '../src/utils';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const patients = [
    {
        'id': 'd2773336-f723-11e9-8f0b-362b9e155667',
        'name': 'John McClane',
        'dateOfBirth': '1986-07-09',
        'ssn': '090786-122X',
        'gender': 'male',
        'occupation': 'New york city cop'
    },
    {
        'id': 'd2773598-f723-11e9-8f0b-362b9e155667',
        'name': 'Martin Riggs',
        'dateOfBirth': '1979-01-30',
        'ssn': '300179-77A',
        'gender': 'male',
        'occupation': 'Cop'
    },
    {
        'id': 'd27736ec-f723-11e9-8f0b-362b9e155667',
        'name': 'Hans Gruber',
        'dateOfBirth': '1970-04-25',
        'ssn': '250470-555L',
        'gender': 'male',
        'occupation': 'Technician'
    },
    {
        'id': 'd2773822-f723-11e9-8f0b-362b9e155667',
        'name': 'Dana Scully',
        'dateOfBirth': '1974-01-05',
        'ssn': '050174-432N',
        'gender': 'female',
        'occupation': 'Forensic Pathologist'
    },
    {
        'id': 'd2773c6e-f723-11e9-8f0b-362b9e155667',
        'name': 'Matti Luukkainen',
        'dateOfBirth': '1971-04-09',
        'ssn': '090471-8890',
        'gender': 'male',
        'occupation': 'Digital evangelist'
    }
];

const patientEntries: PatientEntry [] = patients.map(obj => {
    const object = toNewPatientEntry(obj) as PatientEntry;
    object.id = obj.id;
    return object;
});

export default patientEntries;

// src/routes/patients.ts

import express from 'express';
import patientService from '../services/patientsService';
import toNewPatientEntry from '../utils';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const router = express.Router();

router.get('/', (_req, res) => {
    res.send(patientService.getNonSensitiveEntries());
});

router.post('/', (req, res) => {
    try {
        const newPatientEntry = toNewPatientEntry(req.body);
        const newPatient = patientService.addPatient(newPatientEntry);
        res.json(newPatient);
    } catch (error) {
        res.status(400).send(error.message);
    }

});

export default router;

// src/servicdes/patientsService.ts

import patients from '../../data/patients';
import { PatientEntry, NonSensitivePatientEntry, NewPatientEntry } from '../types';

const getEntries = ():Array<PatientEntry> => {
    return patients;
};

const getNonSensitiveEntries = (): NonSensitivePatientEntry[] => {
    return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
        id, 
        name, 
        dateOfBirth, 
        gender, 
        occupation
    }));
};

const addPatient = (object:NewPatientEntry): PatientEntry => {
    const newPatient = {
        id: patients.length.toString(),
        ...object
    };
    patients.push(newPatient);
    return newPatient;
};

export default {
    getEntries,
    getNonSensitiveEntries,
    addPatient
};

// src/types.ts

export interface DiagnosisEntry {
    code: string;
    name: string;
    latin?: string;
}

export interface PatientEntry {
    id: string;
    name: string;
    dateOfBirth: string;
    ssn: string;
    gender: Gender;
    occupation: string;
}

export type NonSensitivePatientEntry = Omit<PatientEntry, 'ssn'>;

export type NewPatientEntry = Omit<PatientEntry, 'id'>;

export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other'
}

// src/utils.ts

import { Gender, NewPatientEntry } from './types';
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

const isString = (text: any): text is string => {
    return typeof text === 'string' || text instanceof String;
};

const parseName = (text: any): string => {
    if (!text || !isString(text)) {
        throw new Error(`Incorrect or missing name: ${text}`);
    }
    return text;
};

const parseSSN = (text: any): string => {
    if (!text || !isString(text)) {
        throw new Error(`Incorrect or missing SSN: ${text}`);
    }
    return text;
};

const isDate = (date: any): boolean => {
    return Boolean(Date.parse(date));
};

const parseDOB = (text: any): string => {
    if (!text || !isDate(text)) {
        throw new Error(`Incorrect or missing DoB: ${text}`);
    }
    return text;
};

const parseOccupation = (text: any): string => {
    if (!text || !isString(text)) {
        throw new Error(`Incorrect or missing occupation: ${text}`);
    }
    return text;
};

const isGender = (param: any): param is Gender => {
    return Object.values(Gender).includes(param);
};

const parseGender = (text: any): Gender => {
    if (!text || !isGender(text)) {
        throw new Error(`Incorrect or missing gender: ${text}`);
    }
    return text;
};

const toNewPatientEntry = (object: any): NewPatientEntry => {
    return {
        name: parseName(object.name),
        ssn: parseSSN(object.ssn),
        dateOfBirth: parseDOB(object.dateOfBirth),
        occupation: parseOccupation(object.occupation),
        gender: parseGender(object.gender)
    };
};

export default toNewPatientEntry;