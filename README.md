The Nodulator
=========

A Javascript project that produces an animated canvas based on an image. The image is converted to a bunch of coloured nodes which dynamically move away from the mouse when hovering and towards it when mouse is held or clicked. This version additionally draws lines between close together nodes.

Everything that is needed to see it in action is included.

Installation
========

Simply download all the files and either upload them to a server, run them on a local server or straight from the local repository. If running from the local repository however there may be some permission issues. To counter-act this you must allow file to file access. For instance with chrome run with the parameter --allow-file-access-from-files.

Background Theory
========

If you're interested then once the nodes are created they act as a simple agents based model where each node is an agent and the mouse is a system input. Each frame of animation the nodes are updated based on their current position and the current input.
