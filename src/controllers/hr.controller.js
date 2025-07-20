const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
// const { sendEmail } = require('../services/email.service');
const { userService, logsService } = require('../services/index');
const { queryDesignations } = require("../services/designation.service")

const fromToDateFilter = require('../utils/fromToDateFilter');
const { sendEmailWithTemplete } = require('../services/email.service');
const cron = require('node-cron');
const { Designation } = require('../models');

// using roles 
const makeDailyReport = catchAsync(async (req, res) => {
  const sendMeReport = [];
  //   here im fetching all users with role user
  const allUsers = await userService.queryUsers({ role: 'user' }, { sortBy: '', limit: 500, page: 1, populate: 'reportTo' });
  //   here im fetching all logs belong today
  const todaysLogs = await logsService.queryLogs(
    { createdAt: fromToDateFilter(new Date()) },
    { sortBy: '', limit: 500, page: 1 }
  );
  // here im pushing users into relative hr
  await allUsers.results.forEach(async (element) => {
    var userLogs;
    todaysLogs.results.forEach((item) => {
      if (item.userId.toString() === element.id.toString()) {
        userLogs = item.toObject();
      }
    });
    // here im checking if there is already pushed the id or not
    if (
      sendMeReport.length === 0
        ? true
        : !sendMeReport.some((item) => item.hr._id.toString() === element.reportTo._id.toString())
    ) {
      await sendMeReport.push({ hr: element.toObject().reportTo, users: [] });
    }
    // here im checking in which rh array i have to push the user
    const indexIs = sendMeReport.findIndex((item) => item.hr.id.toString() === element.reportTo.id.toString());
    if (indexIs >= 0) {
      sendMeReport[indexIs].users.push({ user: element.toObject(), userLogs });
    }
  });
  // sending mail here
  sendMeReport.map(async (item) => {
    await sendEmailWithTemplete(item.hr.email || 'ashrafmisnaan@gmail.com', 'Daily Report', 'report', {
      ...item,
    });
  });

  // await sendEmail('asadiqbal@geniusmindzone.com', 'test', 'this is test email from daily tasks');
  // res.status(httpStatus.NO_CONTENT).send({ message: 'Mail sent to HR.' });
  res.send({ allUsers, sendMeReport, todaysLogs });
});




// useing designagions
// const makeDailyReportWithDesignation = catchAsync(async (req, res) => {
//   console.log('response', res)
//   // this array will use to store all users's logs with same designation report to
//   const sendMeReport = [];

//   //   here im fetching all logs belong today
//   const todaysLogs = await await logsService.queryLogs(
//     { createdAt: fromToDateFilter(new Date()) },
//     { sortBy: '', limit: 500, page: 1, populate: 'userId, userId.designationId, logs.projectId', }
//   );
//   console.log('todaysLogs', todaysLogs)
//   // here im sorting logs according to report to
//   await todaysLogs?.results?.map((item) => {
//     if (
//       sendMeReport.length === 0
//         ? true
//         : !sendMeReport.some((sendMeReportItem) => sendMeReportItem.designationIdsToMail?.toString() === item?.userId?.designationId?.reportTo?.toString())
//     ) {
//       sendMeReport.push({ designationIdsToMail: item.userId?.designationId?.reportTo?.toString() ?? 'admin', designation: item.userId.designationId.designation, mailToUserMails: [], logs: [] });
//     }
//     const indexIs = sendMeReport.findIndex((mailItem) => mailItem?.designationIdsToMail?.toString() === item.userId.designationId?.reportTo?.toString() || mailItem?.designationIdsToMail?.toString() === 'admin');
//     console.log('indexIs', indexIs)
//     if (indexIs >= 0) {
//       sendMeReport[indexIs]?.logs.push(item.toObject());
//     }
//   });
//   // getting all users with designation user
//   const ids = sendMeReport.map(sendMeReportItem => sendMeReportItem.designationIdsToMail !== 'admin' ? sendMeReportItem.designationIdsToMail : undefined);
//   console.log('ids', ids)
//   // getting all users with designation ids
//   const allAccountToHaveMail = await userService.queryUsers({ designationId: { $in: ids } }, { sortBy: '', limit: 500, page: 1, });
//   console.log('allAccountToHaveMail', allAccountToHaveMail)
//   await allAccountToHaveMail?.results?.map(async (item) => {
//     sendMeReport.map((element) => {
//       if (element.designationIdsToMail?.toString() === item.designationId?.toString()) {
//         element.mailToUserMails.push(item.email);
//       }
//     })
//   })
//   console.log('allAccountToHaveMail', allAccountToHaveMail )
//   const ifSomeDesigNotHaveReportTo = sendMeReport.some((sendMeReportItem, index) => {
//     if (sendMeReportItem.designationIdsToMail == 'admin' || sendMeReportItem.mailToUserMails.length == 0) {
//       sendMeReport[index].mailToUserMails.push('ashrafmisnaan@gmail.com')
//       return true;
//     } else { return false }
//   });
//   console.log('ifSomeDesigNotHaveReportTo', ifSomeDesigNotHaveReportTo)
//   // sending mail here
//   sendMeReport.map(async (item) => {
//     await sendEmailWithTemplete(item.mailToUserMails ?? 'ashrafmisnaan@gmail.com', 'Daily Report', 'reportWtihDesignation', {
//       ...item,
//     });
//   });
//   const message = ifSomeDesigNotHaveReportTo ? 'Some Desgnations hve no ReportTo fields or Some Desgination have not assign to any user whome we have to send mail so that reports are send to admin.' : 'Mail sent to Respected Designations.';
//   console.log('message', message)
//   console.log('response', res)
//   res.send({ sendMeReport, todaysLogs, allAccountToHaveMail, message });



// });

// const generateDailyReportWithDesignation = async () => {
//   console.log("Generating daily report...");
//   const sendMeReport = [];

//   // Fetch logs for today
//   const todaysLogs = await logsService.queryLogs(
//     { createdAt: fromToDateFilter(new Date()) },
//     { sortBy: "", limit: 500, page: 1, populate: "userId, userId.designationId, logs.projectId" }
//   );
// console.log('todaysLogs', todaysLogs)
//   // Sorting logs based on "reportTo"
//   await todaysLogs?.results?.map((item) => {
//     if (
//       sendMeReport.length === 0 ||
//       !sendMeReport.some(
//         (sendMeReportItem) =>
//           sendMeReportItem.designationIdsToMail?.toString() === item?.userId?.designationId?.reportTo?.toString()
//       )
//     ) {
//       sendMeReport.push({
//         designationIdsToMail: item.userId?.designationId?.reportTo?.toString() ?? "admin",
//         designation: item.userId.designationId.designation,
//         mailToUserMails: [],
//         logs: [],
//       });
//     }
//     const indexIs = sendMeReport.findIndex(
//       (mailItem) =>
//         mailItem?.designationIdsToMail?.toString() === item.userId.designationId?.reportTo?.toString() ||
//         mailItem?.designationIdsToMail?.toString() === "admin"
//     );

//     if (indexIs >= 0) {
//       sendMeReport[indexIs]?.logs.push(item.toObject());
//     }
//   });

//   // Fetching emails of users who should receive reports
//   const ids = sendMeReport.map((sendMeReportItem) =>
//     sendMeReportItem.designationIdsToMail !== "admin" ? sendMeReportItem.designationIdsToMail : undefined
//   );

//   const allAccountToHaveMail = await userService.queryUsers(
//     { designationId: { $in: ids } },
//     { sortBy: "", limit: 500, page: 1 }
//   );

//   await allAccountToHaveMail?.results?.map(async (item) => {
//     sendMeReport.map((element) => {
//       if (element.designationIdsToMail?.toString() === item.designationId?.toString()) {
//         element.mailToUserMails.push(item.email);
//       }
//     });
//   });

//   // Handling cases where designation has no "reportTo" field
//   const ifSomeDesigNotHaveReportTo = sendMeReport.some((sendMeReportItem, index) => {
//     if (sendMeReportItem.designationIdsToMail == "admin" || sendMeReportItem.mailToUserMails.length == 0) {
//       sendMeReport[index].mailToUserMails.push("ashrafmisnaan@gmail.com");
//       return true;
//     } else {
//       return false;
//     }
//   });

//   // Sending emails
//   sendMeReport.map(async (item) => {
//     await sendEmailWithTemplete(
//       item.mailToUserMails ?? "ashrafmisnaan@gmail.com",
//       "Daily Report",
//       "reportWtihDesignation",
//       {
//         ...item,
//       }
//     );
//   });

//   const message = ifSomeDesigNotHaveReportTo
//     ? "Some Designations have no ReportTo fields or some Designations have not been assigned to any user, so reports are sent to the admin."
//     : "Mail sent to Respected Designations.";

//   console.log("Report Generation Completed:", message);
//   return { sendMeReport, todaysLogs, allAccountToHaveMail, message };
// };
const generateDailyReportWithDesignation = async () => {
  console.log("Generating daily report...");
  const sendMeReport = [];

  // Fetch logs for today
  const todaysLogs = await logsService.queryLogs(
    { createdAt: fromToDateFilter(new Date()) },
    { sortBy: "", limit: 500, page: 1, populate: "userId, userId.designationId, logs.projectId" }
  );
  console.log("todaysLogs", todaysLogs);

  // Sorting logs based on "reportTo"
  await todaysLogs?.results?.map((item) => {
    if (
      sendMeReport.length === 0 ||
      !sendMeReport.some(
        (sendMeReportItem) =>
          sendMeReportItem.designationIdsToMail?.toString() === item?.userId?.designationId?.reportTo?.toString()
      )
    ) {
      sendMeReport.push({
        designationIdsToMail: item.userId?.designationId?.reportTo?.toString() ?? "admin",
        level: item.userId?.designationId?.level,
        designation: item.userId.designationId.designation,
        mailToUserMails: [],
        ccMails: [],
        logs: [],
      });
    }

    const indexIs = sendMeReport.findIndex(
      (mailItem) =>
        mailItem?.designationIdsToMail?.toString() === item.userId.designationId?.reportTo?.toString() ||
        mailItem?.designationIdsToMail?.toString() === "admin"
    );

    if (indexIs >= 0) {
      sendMeReport[indexIs]?.logs.push(item.toObject());
    }
  });

  // Fetching users with relevant designations
  const ids = sendMeReport.map((sendMeReportItem) =>
    sendMeReportItem.designationIdsToMail !== "admin" ? sendMeReportItem.designationIdsToMail : undefined
  );
  console.log("ids to fetch users:", ids);

  const allAccountToHaveMail = await userService.queryUsers(
    { designationId: { $in: ids } },
    { sortBy: "", limit: 500, page: 1 }
  );
  console.log("allAccountToHaveMail", allAccountToHaveMail);

  // Assigning main mail recipients
  await allAccountToHaveMail?.results?.map(async (user) => {
    sendMeReport.map((element) => {
      if (element.designationIdsToMail?.toString() === user.designationId?.toString()) {
        element.mailToUserMails.push(user.email);
      }
    });
  });

  // **Adding CC functionality**
  await Promise.all(
    sendMeReport.map(async (element) => {
      let ccList = [];
      console.log('element', element)

      const allDesignations = await queryDesignations({ level: { $lt: element.level }}, { limit: 500, page: 1 })
      console.log('allDesignations', allDesignations)
      const ccLevels = allDesignations?.results?.map((d) => d.level)
      console.log('ccLevels', ccLevels)
      let finalCcLevels = [...new Set(ccLevels)].filter((l) => l !== undefined);
      console.log('finalCcLevels', finalCcLevels)
      for (const level of finalCcLevels) {
        const ccUser = await queryDesignations({ level }, { limit: 500, page: 1 });
        console.log('ccUsers', ccUser);
        const designationId = ccUser.results?.[0]?._id
        const ccUserDetails = await userService.queryUsers(
              { "designationId": designationId },
              { limit: 500, page: 1 }
            );
            console.log('ccUserDetails', ccUserDetails)
        ccList.push(ccUserDetails.results?.[0]?.email);
      }

      // **Find the Project Manager**
      // console.log("Querying for Project Manager...");
      // const projectManagerdesig = await queryDesignations({ "designation": "Project Manager" }, { limit: 500, page: 1 })
      // console.log('projectManagerdesig', projectManagerdesig)
      // if (element.level > projectManagerdesig?.results?.[0]?.level) {
      //   const projectManagerId = projectManagerdesig?.results?.[0]?._id
      //   console.log('projectManagerId', projectManagerId)
      //   const projectManager = await userService.queryUsers(
      //     { "designationId": projectManagerId },
      //     { limit: 500, page: 1 }
      //   );
      //   console.log("projectManager query response:", projectManager);
      //   if (projectManager?.results?.length) {
      //     projectManager.results.forEach((pm) => ccList.push(pm.email));
      //   } else {
      //     console.log("No Project Manager found.");
      //   }
      // }
      // console.log("Querying for CTO...");
      // const ctodesig = await queryDesignations({ "designation": "CTO" }, { limit: 500, page: 1 })
      // console.log('ctodesig', ctodesig)
      // if (element.level > ctodesig?.results?.[0]?.level) {
      //   const ctoId = ctodesig?.results?.[0]?._id
      //   console.log('ctoId', ctoId)
      //   const cto = await userService.queryUsers(
      //     {
      //       "designationId": ctoId,
      //     },
      //     { limit: 500, page: 1 }
      //   );
      //   console.log("cto query response:", cto);
      //   if (cto?.results?.length) {
      //     cto.results.forEach((ctoPerson) => ccList.push(ctoPerson.email));
      //   } else {
      //     console.log("No CTO found.");
      //   }
      // }
      // console.log("Querying for Admin...");
      // const admin = await userService.queryUsers({ role: "admin" }, { limit: 500, page: 1 });
      // console.log("admin query response:", admin);
      // if (admin?.results?.length) {
      //   admin.results.forEach((adminUser) => ccList.push(adminUser.email));
      // } else {
      //   console.log("No Admin found.");
      // }

      console.log("ccList before removing duplicates:", ccList);
      // Remove duplicates
      element.ccMails = [...new Set(ccList)].filter((mail) => mail  !== undefined)
      console.log("ccList after removing duplicates:", element.ccMails);
    })
  );

  // Handling cases where designation has no "reportTo" field
  const ifSomeDesigNotHaveReportTo = sendMeReport.some((sendMeReportItem, index) => {
    if (sendMeReportItem.designationIdsToMail == "admin" || sendMeReportItem.mailToUserMails.length == 0) {
      sendMeReport[index].mailToUserMails.push("ashrafmisnaan@gmail.com");
      return true;
    } else {
      return false;
    }
  });
  console.log("ifSomeDesigNotHaveReportTo", ifSomeDesigNotHaveReportTo);

  // Sending emails with CC
  await Promise.all(
    sendMeReport.map(async (item) => {
      await sendEmailWithTemplete(
        item.mailToUserMails ?? "ashrafmisnaan@gmail.com", // To
        "Daily Report",
        "reportWtihDesignation",
        {
          ...item,
          cc: item.ccMails, // CC Recipients
        }
      );
      console.log("Email sent with CC:", item.ccMails);
    })
  );

  const message = ifSomeDesigNotHaveReportTo
    ? "Some Designations have no ReportTo fields or some Designations have not been assigned to any user, so reports are sent to the admin."
    : "Mail sent to Respected Designations.";

  console.log("Report Generation Completed:", message);
  console.log("sendMeReport", sendMeReport);
  console.log("allAccountToHaveMail", allAccountToHaveMail);

  return { sendMeReport, todaysLogs, allAccountToHaveMail, message };
};




const makeDailyReportWithDesignation = catchAsync(async (req, res) => {
  const result = await generateDailyReportWithDesignation();
  console.log('result', result)
  res.send(result);
});
// simple mail
const contactToHr = catchAsync(async (req, res, next) => {
  await sendEmailWithTemplete('ashrafmisnaan@gmail.com', 'testing templete', 'email', {});
  res.status(httpStatus.NO_CONTENT).send({ message: 'Mail sent to HR.' });
});

cron.schedule("* 2 * * *", catchAsync(async () => {
  console.log("Running scheduled email report...");
  const result = await generateDailyReportWithDesignation();
  console.log('result', result)
  console.log("Report sent successfully.");
}));
module.exports = {
  makeDailyReport,
  contactToHr,
  makeDailyReportWithDesignation
};
