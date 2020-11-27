import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header';
import Content from './components/Content';
import Total from './components/Total';
import { CoursePart } from './interfaces';


const courseParts: CoursePart[] = [
    {
        name: 'Fundamentals',
        exerciseCount: 10,
        description: 'This is an awesome course part'
    },
    {
        name: 'Using props to pass data',
        exerciseCount: 7,
        groupProjectCount: 3
    },
    {
        name: 'Deeper type usage',
        exerciseCount: 14,
        description: 'Confusing description',
        exerciseSubmissionLink: 'https://fake-exercise-submit.made-up-url.dev'
    },
    {
        name: 'Our fake example',
        exerciseCount: 7,
        description: 'Just filling space',
        someWeirdThing: 'idk even know'
    }
];

const App: React.FC = () => {
    const courseName = 'Half Stack application development';

    return (
        <div>
            <Header courseName={courseName} />
            <Content content={courseParts} />
            <Total content={courseParts} />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));

// Interfaces.tsx


interface CoursePartBase {
    name: string;
    exerciseCount: number;
}

interface CoursePartTwo extends CoursePartBase {
    name: 'Using props to pass data';
    groupProjectCount: number;
}

interface CoursePartOneThree extends CoursePartBase {
    name: 'Fundamentals' | 'Deeper type usage';
    description: string;
    exerciseSubmissionLink?: string;
}

interface CoursePartFakeFour {
    name: 'Our fake example';
    exerciseCount: number;
    description: string;
    someWeirdThing: string;
}

export interface PartComponents {
    name: string;
    exerciseCount: number;
    description?: string;
    groupProjectCount?: number;
    exerciseSubmissionLink?: string;
    someWeirdThing?: string;
}

export type CoursePart = CoursePartOneThree | CoursePartTwo | CoursePartFakeFour;

// Content.tsx

import React from 'react';
import { CoursePart, PartComponents } from '../interfaces';

const Part: React.FC<{ content: PartComponents }> = ({ content }) => {
    switch (content.name) {
    case 'Fundamentals':
        return (
            <p>{content.name} {content.exerciseCount} {content.description} </p>
        );
    case 'Using props to pass data':
        return (
            <p>{content.name} {content.exerciseCount} {content.groupProjectCount}</p>
        );
    case 'Deeper type usage':
        return (
            <p>{content.name} {content.exerciseCount} {content.description} {content.exerciseSubmissionLink} </p>
        );
    case 'Our fake example':
        return (
            <p>{content.name} {content.exerciseCount} {content.description} {content.someWeirdThing}</p>
        );
    default:
        return null;
    }
};

const Content: React.FC<{ content: Array<CoursePart> }> = ({ content }) => {
    console.log(content);
    return (
        <div>
            {content.map((content, ind) =>
                <Part key={ind} content={content} />
            )}
        </div>
    );
};

export default Content;