const skill = require("../src/index");

skill.arm({}, {}, () => {
    console.log('callback');

});
//skill.handler({}, {}, {});