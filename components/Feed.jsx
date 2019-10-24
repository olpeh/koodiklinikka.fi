import _ from "lodash";
import React from "react";
import request from "axios";
import timeago from "timeago";
import api from "./api";
import transformers from "./feed-transformers";

function throwError(err) {
  setTimeout(() => {
    console.log(err.stack);
    throw err;
  });
}

export default class Feed extends React.Component {
  state = {
    messages: []
  };

  componentDidMount() {
    request
      .get(api("feeds"))

      .then(res => {
        const messages = _(res.data)
          .map((messages, type) => transformers[type](messages))
          .flatten()
          .value();

        this.setState({
          messages: _(messages)
            .sortBy("timestamp")
            .reverse()
            .value()
            .slice(0, 40)
        });
      })
      .catch(throwError);
  }

  render() {
    var messages = this.state.messages.map((message, i) => {
      var image = <img src={message.image} />;

      if (message.imageLink) {
        image = (
          <a target="_blank" href={message.imageLink}>
            {image}
          </a>
        );
      }

      return (
        <div className="message" key={i}>
          <div className="message__image">{image}</div>
          <div className="message__content">
            <div className="message__user">
              <a href={message.userLink}>{message.user}</a>
            </div>
            <div
              className="message__body"
              dangerouslySetInnerHTML={{ __html: message.body }}
            ></div>
            <div className="message__icon">
              <i className={`fa fa-${message.type}`}></i>
            </div>
            <div className="message__details">
              <span className="message__timestamp">
                {timeago(message.timestamp)}
              </span>
              <span className="message__meta">{message.meta}</span>
            </div>
          </div>
        </div>
      );
    });

    return <div className="feed">{messages}</div>;
  }
}
