The Nodulator
=========

A Javascript project that produces an animated canvas based on an image. The image is converted to coloured nodes by overlaying a grid. Once converted, the nodes dynamically move away from the mouse when hovering and towards it when mouse is held or clicked. 

Live demo: http://Lif3line.github.io/nodulator

MIT Licence

Installation
========

Download the repo and either upload it to a server, run them on a local server or straight from the local repository. If running from a local repository, however, there will be some permission issues due to your browser (correctly) stopping cross-origin loading. 

To run in Chrome, ensure Chrome is closed, then run the following on a command line: `"path\to\chrome.exe" --allow-file-access-from-files "path\to\index.html"`
`

Background Theory
========

Once the nodes are created they act as a simple agent-based model where each node is an agent and the mouse is a system input. For each frame of animation the nodes are updated based on their current position and the current input.
