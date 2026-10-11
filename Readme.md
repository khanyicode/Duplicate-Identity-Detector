# Duplicate Identity Detector AI

**An AI-assisted fintech solution for KYC identity matching, duplicate detection, and fraud prevention.**

## 1. Project Overview

The Duplicate Identity Detector AI is a cloud-based fintech application designed to identify potential duplicate customer identities during Know Your Customer (KYC) onboarding.

Financial institutions process large volumes of customer registrations. Duplicate records can arise from repeated registrations, inconsistent data entry, spelling variations, or changes to customer contact information. Some cases may also indicate suspicious onboarding activity.

This project aims to help financial institutions identify potentially duplicated customer profiles by comparing identity attributes, calculating match scores, explaining matching results, and providing a human-review workflow.

The system is designed to support KYC investigations rather than automatically determine that a customer has committed fraud.

## 2. Problem Statement

Manual identity verification can be time-consuming and inconsistent, particularly when financial institutions manage large customer databases.

Common challenges include:

- Customers registering more than once.
- Names containing spelling mistakes or formatting differences.
- Changes to phone numbers or email addresses.
- Duplicate records caused by inconsistent data entry.
- Suspicious registrations involving reused identity information.
- Legitimate customers being incorrectly flagged as duplicates.

The proposed solution uses identity-matching rules, fuzzy matching, and optional AI-generated explanations to help reviewers investigate potential duplicate identities more efficiently.

## 3. Project Objectives

The primary objectives are to:

1. Compare two or more customer profiles.
2. Identify exact matches across selected identity attributes.
3. Detect approximate matches despite spelling and formatting differences.
4. Calculate explainable match scores.
5. Identify conflicting or missing customer information.
6. Prioritise potential matches for human review.
7. Maintain a review history and record investigation outcomes.
8. Provide a dashboard showing detection statistics and review status.
9. Evaluate matching accuracy using labelled synthetic datasets.
10. Demonstrate automated API testing, quality assurance, and cloud deployment.

## 4. Core Features

### 4.1 Customer Profile Comparison

Compare customer attributes such as:

- First name
- Last name
- Date of birth
- Identity number
- Phone number
- Email address

### 4.2 Intelligent Identity Matching

Use a combination of:

- Exact field matching.
- Fuzzy name matching.
- Normalisation of text and formatting.
- Weighted scoring across multiple attributes.
- Conflict detection when important attributes disagree.

### 4.3 Explainable Match Scoring

For each potential match, the system should display:

- Match score.
- Review priority.
- Matching attributes.
- Conflicting attributes.
- Reasons for flagging the profiles.
- Recommended next steps.

The scoring system will begin with transparent rules and can be improved using evaluated matching algorithms.

### 4.4 Review Management

Authorised reviewers should be able to:

- View potential duplicate cases.
- Compare the relevant customer attributes.
- Mark cases as confirmed duplicates.
- Mark cases as legitimate separate customers.
- Request further investigation.
- Record review notes and timestamps.
- View the history of review decisions.

### 4.5 Dashboard and Analytics

The React dashboard should display:

- Total profiles scanned.
- Total potential matches.
- High-priority cases awaiting review.
- Confirmed duplicate cases.
- False-positive outcomes identified during evaluation.
- Recent investigation activity.

### 4.6 Quality Assurance and Monitoring

The project will include automated tests, matching-performance measurements, API validation, and error handling to assess the reliability of the system.


The matching engine should remain functional without an AI service. AI explanations must be based on actual matching results rather than invented evidence.