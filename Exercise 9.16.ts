// src/routes/patients.ts

import express from 'express';
import patientService from '../services/patientsService';
import toNewPatientEntry from '../utils';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const router = express.Router();

router.get('/', (_req, res) => {
    res.send(patientService.getNonSensitiveEntries());
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.send(patientService.getById(id));
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

// src/services/patientsService.ts

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

const getById = (id: string): PatientEntry => {
    const individualPatient = patients.filter((patient: PatientEntry) => patient.id === id);
    return individualPatient[0];
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
    addPatient,
    getById
};

// src/utils

    // Excluding the other parsing functions for brevity

const isEntry = (entry: any) => {
    return Array.isArray(entry);
};

const parseEntries = (entries: Array<Entry>) => {
    if (!isEntry(entries)) {
        throw new Error(`Invalid entry provided: ${entries}`);
    }
    return entries;
};

const toNewPatientEntry = (object: any): NewPatientEntry => {
    return {
        name: parseName(object.name),
        ssn: parseSSN(object.ssn),
        dateOfBirth: parseDOB(object.dateOfBirth),
        occupation: parseOccupation(object.occupation),
        gender: parseGender(object.gender),
        entries: parseEntries(object.entries)
    };
};