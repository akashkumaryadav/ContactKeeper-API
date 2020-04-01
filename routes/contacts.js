const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const router = express.Router();

//models
const User = require("../models/User");
const Contact = require("../models/Contact");

// @route /api/contacts
// @desc  GET all contacts of user
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort("-1");
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
});

// @route /api/contacts
// @desc  POST ADD contacts
// @access Private

router.post("/", auth, async (req, res) => {
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ msg: errors.array() });
  }
  const { name, email, phone, contacttype } = req.body;

  try {
    const newContact = new Contact({
      name: name,
      email: email,
      phone: phone,
      contacttype: contacttype,
      user: req.user.id
    });
    contact = await newContact.save();
    res.json(contact);
  } catch (error) {
    console.log(error);

    res.status(401).json({ msg: error });
  }
});

// @route /api/contacts/:id
// @desc  PUT update the contact
// @access Private

router.put("/:id", auth, async (req, res) => {
  const contactFields = {};
  const { name, email, phone, contacttype } = req.body;
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (contacttype) contactFields.contacttype = contacttype;
  // contact = await Contact.findByIdAndUpdate(req.params.id);
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorized" });
    }
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $set: contactFields
      },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @route /api/contacts/:id
// @desc  DELETE a contact
// @access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    console.log(contact);
    if (!contact) {
      return res.status(404).json({ msg: "Contact Not Found" });
    }
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not AUthorized" });
    }
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ msg: "DELETED" });
  } catch (err) {
    res.status(500).json({ msg: "server error" });
  }
});

module.exports = router;
