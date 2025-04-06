function scrollSentence() {
  const containerSeen = document.querySelector(".one");
  containerSeen.scrollTop =
    containerSeen.scrollHeight - containerSeen.clientHeight;

  const containerHue = document.querySelector(".two");
  containerHue.scrollTop =
    containerHue.scrollHeight - containerHue.clientHeight;

  const containerBinary = document.querySelector(".three");
  containerBinary.scrollTop =
    containerBinary.scrollHeight - containerBinary.clientHeight;
}

setInterval(scrollSentence, 500);
