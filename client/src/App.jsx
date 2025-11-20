import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TextEditor from './component/TextEditor';
import { v4 as uuidv4 } from 'uuid';
const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Redirect from "/" to a document */}
          <Route path="/" element={<Navigate to={`/document/${uuidv4()}`} replace />} />

          {/* Document route */}
          <Route path="/document/:id" element={<TextEditor />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
