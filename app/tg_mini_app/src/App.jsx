import Profile from "./Student/Profile"

function App() {
    console.log('🟢 App rendered');

    return (
    <div>
      <Profile id={3}/>
    </div>
  );
}

export default App;