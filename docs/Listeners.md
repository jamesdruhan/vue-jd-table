# JD-Table / Listeners

When JD-Table is mounted a listener is initialized which watches for changes to the browser window size. This listener is important for mobile responsiveness as well as the virtual scroll rendering engine.

**IMPORTANT**
> There is no action required on your behalf regarding the below listeners. This page is just to inform you of what JD-Table monitors and the impact certain actions will have.
### Mobile

In order to show/hide and resize certain elements depending on the browser size JD-Table checks the window size each time it is resized. At certain breakpoints, various CSS classes will be enabled/disabled accordingly, for responsiveness.

### Virtual Scroll Rendering

The virtual scroll rendering feature has many calculations which is based on the amount of rows that are visible in the JD-Table frame. Depending on responsiveness settings, as the window size changes, the amount of rows visible in the table can change. As such, virtual scroll calculations need to be reviewed and updated. 