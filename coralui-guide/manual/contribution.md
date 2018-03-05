# Contribution

## Open Development

Coral Spectrum follows open development principles:
* The code is discoverable and openly available to anyone.
* Discussions about Coral Spectrum happen on an open and archived channel.
* All important technical decisions are exposed on that channel.
* All commits are backed by issues in an openly accessible tracker, which offers a self-service overview of the project's status and history.
* People who are not members of the core team are encouraged to provide contributions.
* Meritocracy is taken into account when considering the priority of contributions and suggestions. 
The more you contribute, and the more valuable your contributions are, the more influence you will have within the project.

**Slack channel: #coral_spectrum**

## Find Tasks

All Coral Spectrum work is tracked in our [JIRA project](https://jira.corp.adobe.com/browse/CORAL). Before you look there, be sure 
you've contacted the community. 
We prioritize blocker and critical defects first, though submissions of new components and other 'non-bug' contribution is welcome. 
Just talk to the community and we will work it out.

Once you are ready to submit a bug, find an issue to fix, find a feature to work on, or document a new task, go to JIRA. 
Everything is in JIRA.

## Development

Below are steps to take to when starting as a contributor.

### Tools

You will need the following tools to work with Coral Spectrum:
* node
* npm
* git

If you don't have those tools working, get that set up first.

### Track your work

Before starting, make sure the work you are doing is tracked in JIRA. Create an issue if one doesn't already exist. 
An issue description should be complete and include steps to reproduce if the issue is a defect.

### Work on branches

It is required that you work on a feature branch, even in your own fork. The feature branch naming convention is 
`issue/CORAL-x`. CORAL-x corresponds to the JIRA ticket.

### Coding Conventions

This gives guide to general coding conventions for Coral Spectrum. These are generally enforced at the time of code review.

#### General Principles

* Write readable code (descriptive names, logically organized, comments etc.)
* Preserve modularity
* Keep backward compatibility in mind
* Don't use deprecated APIs
* Touch in-mind
* Performance is critical

#### General Formatting

We included an `.editorconfig` file to set up the defaults. In addition, the code is linted based on the 
[Adobe eslint configuration](https://git.corp.adobe.com/experience-platform/adobe-js-code-standards/).

Use `gulp lint` to run linting.

#### Add Adobe disclaimer

```
/*
* ADOBE CONFIDENTIAL
*
* Copyright [YEAR] Adobe Systems Incorporated
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any. The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
*/
```
 
### Definition of done
 
* Work is tracked in JIRA
* API changes are approved by the community
* Code is complete (documented, meets accessibility standards and automated tests added)
* All tests passing (no regressions)
* Verified working on all supported browsers

## Submitting Code

You will be ready to submit your code when your work meets the Definition of Done. 
Once ready, your work must be peer reviewed by a pull request.
 
In some cases minor work may receive only "+1" as a comment, which just indicates the code was reviewed and no changes were needed.
When review is done, the pull request will be merged by the community and any related JIRA issues will be closed. 
  
 

