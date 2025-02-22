import React from "react";
import { withRouter } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { BsInfoCircle } from "react-icons/bs";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = "en-us";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      errors: {},
      isListening: false,
      isPlayingAudio: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderErrors = this.renderErrors.bind(this);

    this.handleListen = this.handleListen.bind(this);
    this.loginDemo = this.loginDemo.bind(this);
  }

  componentDidMount() {
    this.handleListen();
    this.props.clearSessionErrors();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.currentUser) {
  //     // this.props.history.push("/events");
  //   }

  //   // Set or clear errors
  //   this.setState({ errors: nextProps.errors });
  // }

  handleListen() {
    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      console.log(transcript);

      if (transcript.includes("submit")) {
        const email = this.state.email.replaceAll(" ", "").toLowerCase();
        let password = this.state.password.replace(" submit", "");
        password = password.replace(" something", "");
        const user = {
          email,
          password,
        };

        this.props.login(user, this.props.history);
        if (this.props.history === "/profile") {
          mic.stop();
        }
      } else if (transcript.includes("password")) {
        const last = transcript.indexOf("word is");
        let realTranscript = transcript.slice(last + 8);
        realTranscript = realTranscript.replace(" something", "");
        realTranscript = realTranscript.replace(" submit", "");
        this.setState({ password: realTranscript });
      } else if (transcript.includes("email")) {
        const last = transcript.indexOf("email is");
        let realTranscript = transcript.slice(last + 8);
        realTranscript = realTranscript.replace("my pas", "");
        realTranscript = realTranscript.replace("my ", "");

        if (realTranscript.includes("at")) {
          realTranscript = realTranscript.replace("at", "@");
          this.setState({
            email: realTranscript.replaceAll(" ", "").toLowerCase(),
          });
        } else if (realTranscript.includes("dot")) {
          realTranscript = realTranscript.replace("dot", ".");
          this.setState({
            email: realTranscript.replaceAll(" ", "").toLowerCase(),
          });
        } else {
          this.setState({
            email: realTranscript.replaceAll(" ", "").toLowerCase(),
          });
        }
      }

      mic.onerror = (event) => {
        console.log(event.error);
      };
    };
  }

  setIsListening(e) {
    // e.preventDefault();
    const audio = document.getElementById("myAudio");
    this.setState({ isListening: !this.state.isListening }, () => {
      if (this.state.isListening) {
        this.setState({ isPlayingAudio: false });
        audio.pause();
        mic.start();
      } else {
        mic.stop();
      }
    });
  }

  playAudio(e) {
    this.setState({ isPlayingAudio: !this.state.isPlayingAudio }, () => {
      const audio = document.getElementById("myAudio");
      if (this.state.isPlayingAudio) {
        this.setState({ isListening: false });
        mic.stop();
        audio.play();
      } else {
        this.setState({ isListening: false });
        mic.stop();
        audio.pause();
      }
    });
  }

  // Handle field updates (called in the render method)
  update(field) {
    return (e) =>
      this.setState({
        [field]: e.currentTarget.value,
      });
  }

  // Handle form submission
  handleSubmit(e) {
    e.preventDefault();

    let user = {
      email: this.state.email,
      password: this.state.password,
    };

    this.props.login(user, this.props.history);
  }

  loginDemo(e) {
    e.preventDefault();
    this.props.fetchDemoUser().then(() => this.props.history.push("/profile"));
  }

  // Render the session errors if there are any
  renderErrors() {
    return (
      <ul>
        {Object.keys(this.state.errors).map((error, i) => (
          <li style={{ marginBottom: 10 }} key={`error-${i}`}>
            {this.state.errors[error]}
          </li>
        ))}
      </ul>
    );
  }

  render() {
    const { errors, clearSessionErrors } = this.props;
    return (
      <div className="form-container">
        <div className="form">
          <div className="form__content">
            <form className="form-inner" onSubmit={this.handleSubmit}>
              <div className="form__field">
                <i>
                  <FaUser style={{ marginRight: 10 }} />
                </i>
                <div className="input-container">
                  <input
                    // onClick={errors.email ? () => clearSessionErrors() : ""}
                    className="input-holder"
                    type="text"
                    name="email"
                    value={this.state.email}
                    onChange={this.update("email")}
                    placeholder="Enter your email"
                  />
                  {errors.email ? (
                    <p className="error-text">{errors.email}</p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <br />
              <div className="form__field">
                <i>
                  <RiLockPasswordFill style={{ marginRight: 10 }} />
                </i>
                <div className="input-container">
                  <input
                    // onClick={errors.name ? () => clearSessionErrors() : ""}
                    className="input-holder"
                    type="text"
                    name="password"
                    value={this.state.password}
                    onChange={this.update("password")}
                    placeholder="Enter your password"
                  />
                  {errors.password ? (
                    <p className="error-text">{errors.password}</p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <br />
              <div className="button-container">
                <button className="form_submit" type="submit">
                  <span className="button__text">LOG IN NOW</span>
                </button>
                <br />
                <button
                  className="form_submit"
                  type="submit"
                  onClick={this.loginDemo}
                >
                  <span className="button__text">Demo User</span>
                </button>

                <div className="mic">
                  <audio id="myAudio">
                    <source
                      src="https://atb-photos.s3.amazonaws.com/login_intro.mp3"
                      type="audio/mp3"
                    />
                  </audio>
                  {this.state.isListening ? (
                    <div className="mic-on">
                      <div className="micro-container" style={{ width: "90%" }}>
                        <span
                          className="form_submit micro"
                          onClick={this.setIsListening.bind(this)}
                        >
                          Stop Voice Input
                        </span>
                        <span
                          style={{
                            color: "orange",
                            marginTop: 15,
                            marginLeft: 20,
                          }}
                        >
                          {" "}
                          <BsInfoCircle onClick={this.playAudio.bind(this)} />
                        </span>
                      </div>
                      <div className="loader">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span id="mic">🎙️</span>
                    </div>
                  ) : (
                    <div style={{ width: "90%" }}>
                      <div className="micro-container">
                        <span
                          className="form_submit micro"
                          onClick={this.setIsListening.bind(this)}
                          style={{ marginLeft: 0 }}
                        >
                          Log in with Voice
                        </span>
                        <span
                          style={{
                            color: "orange",
                            marginTop: 15,
                            marginLeft: 20,
                          }}
                        >
                          {" "}
                          <BsInfoCircle onClick={this.playAudio.bind(this)} />
                        </span>
                      </div>
                      {this.state.isPlayingAudio ? (
                        <div className="mic-on">
                          <div className="loader">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <span id="mic">👂</span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  )}
                </div>
                {/* <br /> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(LoginForm);
