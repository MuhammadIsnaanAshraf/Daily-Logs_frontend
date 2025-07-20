const subjects = {
  profile: 'profile',
  log: 'log',
  user: 'user',
  attendance: 'attendance',
  designation: 'designation',
  project: 'project',
  all: 'all',
}
const actions = {
  read: 'read',
  readAll: 'readAll',
  create: 'create',
  manage: 'manage',
  update: 'update',
  delete: 'delete',
}
const allRoles = {
  user: [
    // log access
    {
      action: actions.read,
      subject: subjects.log
    },
    {
      action: actions.readAll,
      subject: subjects.log
    },
    {
      action: actions.create,
      subject: subjects.log
    },
    {
      action: actions.update,
      subject: subjects.log
    },
    // profile access
    {
      action: actions.read,
      subject: subjects.profile
    },
    {
      action: actions.update,
      subject: subjects.profile
    },
    // project access
    {
      action: actions.readAll,
      subject: subjects.project
    },
    // designation access
    {
      action: actions.readAll,
      subject: subjects.designation
    },
    // user access
    {
      action: actions.read,
      subject: subjects.user
    },
   
  ],
  //   teamLeader: [
  //     {
  //     action: actions.read,
  //     subject:subjects.all
  //   },
  //   {
  //     action: actions.create,
  //     subject: subjects.log
  //   },
  //   {
  //     action: actions.update,
  //     subject:subjects.log
  //   },
  //   {
  //     action: actions.update,
  //     subject:subjects.profile
  //   }
  // ],
  admin: [
    {
      action: actions.manage,
      subject: subjects.all
    }
  ],
  // hr: [
  //   {
  //     action: actions.manage,
  //     subject: subjects.all
  //   }
  // ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
  subjects,
  actions
};
