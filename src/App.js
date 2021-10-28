require('dotenv').config();

/*eslint-disable */
import ReactMicComponent from './components/ReactMicComponent';
import './App.css';
/*eslint-enable */

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Owlapaloozin'
        <ReactMicComponent />
      </header>
    </div>
  );
}

export default App;
