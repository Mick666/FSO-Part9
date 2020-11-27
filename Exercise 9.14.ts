//Index.tsx
import React from "react";
import ReactDOM from "react-dom";
import Header from './components/Header';
import Content from './components/Content';
import Total from './components/Total';


const App: React.FC = () => {
  const courseName = "Half Stack application development";
  const courseParts = [
    {
      name: "Fundamentals",
      exerciseCount: 10
    },
    {
      name: "Using props to pass data",
      exerciseCount: 7
    },
    {
      name: "Deeper type usage",
      exerciseCount: 14
    }
  ];

  return (
    <div>
      <Header courseName={courseName} />
      <Content content={courseParts} />
      <Total content={courseParts} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

//Header.tsx

import React from "react";

const Header: React.FC<{ courseName: string}> = ({ courseName }) => {
    return (
        <div>
            {courseName}
        </div>
    )
}

export default Header;

//Content.tsx

import React from "react";

const Content: React.FC<{ content: Array<{name: string, exerciseCount: number}> }> = ({ content }) => {
    console.log(content)
    return (
        <div>
            {content.map((content, ind) => 
                    <p key={ind}>{content.name} {content.exerciseCount}</p>
            )}
        </div>
    )
}

export default Content;

// Total.tsx

import React from "react";

const Total: React.FC<{ content: Array<{name: string, exerciseCount: number}> }> = ({ content }) => {
    return (
        <p>
        Number of exercises{" "}
        {content.reduce((carry, part) => carry + part.exerciseCount, 0)}
      </p>
    )
}

export default Total;