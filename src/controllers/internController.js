const emailValidator = require("email-validator");
// const mobileNoValidator = require("validate-phone-number-node-js");
const internModel = require("../models/internModel");
const collegeModel = require("../models/collegeModel");

let nameRegex = /^[a-z A-Z]{1,20}$/
// let mobileRegex = /^[6-9]\d{9}$/gi
let mobileRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/

let createIntern = async function (req, res) {
    try {
        let data = req.body;
        let { name, email, mobile, collegeName } = data;
        if (Object.keys(data).length != 0) {

            if (!name || name == "") {
                return res.status(400).send({ status: false, message: "Invalid request . Name is mandatory." });
            }

            if (!nameRegex.test(name)) {
                return res.status(400).send({ status: false, message: "Please provide valid Intern name." });
            }

            if (!email || email == "") {
                return res.status(400).send({ status: false, message: "Invalid request . Email is mandatory." });
            }

            if (!emailValidator.validate(email)) {
                return res.status(400).send({ status: false, message: "Invalid email.Please Enter a valid Email." });
            }
            const existEmail = await internModel.findOne({ email: data.email });
            if (existEmail) {
                return res.status(400).send({ status: false, message: "Email is already exists , please try with another Email Id." });
            }

            if (!mobile || mobile == "") {
                return res.status(400).send({ status: false, message: "Invalid request , Mobile Number is mandatory." });
            }

            if (!mobileRegex.test(mobile)) {
                return res.status(400).send({ status: false, message: "Invalid request . Please Enter a valid Mobile Number." });
            }
            const existMobile = await internModel.findOne({ mobile: data.mobile });
            if (existMobile) {
                return res.status(400).send({ status: false, message: "Mobile Number is already exists , please try with another Mobile Number." })
            }

            if (!collegeName || collegeName == "") {
                return res.status(400).send({ status: false, message: "Invalid request , College Name is mandatory" });
            }

            const findCollegeId = await collegeModel.findOne({ name: collegeName }).select({ _id: 1 });
            if (!findCollegeId) {
                return res.status(404).send({ status: false, message: "No college found , please enter valid college name." });
            }
            data.collegeId = findCollegeId._id;

            const createInterns = await internModel.create(data);

            const result = await internModel.findById(createInterns._id).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
            res.status(201).send({ status: true, data: result });
        } else {
            return res.status(400).send({ status: false, message: "Invalid request." });
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

const getdata = async (req, res) => {
    try {
        const data = req.query.collegeName
        if (Object.keys(req.query).length != 0) {
            let getall = await collegeModel.findOne({name: data });
            
            if (!getall) {
                return res.status(404).send({ status: false, message: "Data not found." });
            }
            let Id = getall._id;
            console.log(Id);
            let finaldata = await internModel.find({ collegeId: Id }).select({ name: 1, email: 1, mobile: 1, _id: 1 });
            if (finaldata.length == 0) {
                return res.status(404).send({ status: false, message: "No interns." });
            }
            let x = finaldata;
            let interns = await collegeModel.findOne({ name:data }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, isDeleted: 0 })

            interns._doc.interns = x;

            res.status(200).send({ status: false, data: interns });
        } else {
            return res.status(400).send({ status: false, message: "Invalid Request." });
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { createIntern, getdata };