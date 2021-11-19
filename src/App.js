require('dotenv').config();

/*eslint-disable */
import ReactMicComponent from './components/ReactMicComponent';
import './App.css';
/*eslint-enable */

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          AWS Transcription Service
        </div>
        <br />
        <ReactMicComponent />
      </header>
    </div>
  );
}

export default App;
