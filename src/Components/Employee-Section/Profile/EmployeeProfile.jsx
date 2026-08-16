import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form, Nav, Tab } from "react-bootstrap";
import EmployeeSidebar from ".././EmployeeSidebar";
import Topbar from ".././Topbar";
import ProfileBanner from "./ProfileBanner";
import "./EmployeeProfile.css";
import apiClient from "../../../utils/apiClient";

// ====================== INITIAL STATE ======================
const initialProfile = {
	profileImage: "",
	name: "",
	gender: "",
	dob: "",
	maritalStatus: "",
	nationality: "",
	bloodGroup: "",
	email: "",
	phone: "",
	address: "",
	emergencyContactNumber: "",
	relationship: "",
	empType: "",
	department: "",
	location: "",
	supervisor: "",
	hrManager: "",
	empId: "",
	status: "",
};

const initialEducation = {
	institution: "",
	location: "",
	startDate: "",
	endDate: "",
	qualification: "",
	specialization: "",
	skills: [],
	portfolio: "",
};

const initialExperience = {
	company: "",
	jobTitle: "",
	startDate: "",
	endDate: "",
	responsibilities: "",
	totalYears: "",
};

const initialBank = {
	bankName: "",
	branch: "",
	accountNumber: "",
	ifsc: "",
	aadhaar: "",
	pan: "",
};

const initialDocs = [];

// ====================== COMPONENT ======================
const EmployeeProfile = () => {
	const [activeTab, setActiveTab] = useState("personal");
	const [profile, setProfile] = useState(initialProfile);
	// const [education, setEducation] = useState(initialEducation);
	const [experience, setExperience] = useState(initialExperience);
	// const [bank, setBank] = useState(initialBank);
	const [documents, setDocuments] = useState(initialDocs);
	const [isDragOver, setIsDragOver] = useState(false);

	//new
	const [personalErrors, setPersonalErrors] = useState({});
	const [personalBackup, setPersonalBackup] = useState(null); //new
	const [educationErrors, setEducationErrors] = useState({});
	const [experienceBackup, setExperienceBackup] = useState(null);
	const [educationBackup, setEducationBackup] = useState(null);
	const [documentsBackup, setDocumentsBackup] = useState(null);
	const [deletedDocIds, setDeletedDocIds] = useState([]);
	const [experienceErrors, setExperienceErrors] = useState({});
	const [education, setEducation] = useState({
		institution: "",
		location: "",
		startDate: "",
		endDate: "",
		qualification: "",
		specialization: "",
		portfolio: "",

		skills: ["Illustrator", "Photoshop", "Figma", "Adobe XD"],
	});

	const [skillInput, setSkillInput] = useState("");

	const [bank, setBank] = useState({
		bankName: "",
		branch: "",
		accountNumber: "",
		ifsc: "",
		aadhaar: "",
		pan: "",
	});

	const [savedBank, setSavedBank] = useState({
		bankName: "",
		branch: "",
		accountNumber: "",
		ifsc: "",
		aadhaar: "",
		pan: "",
	});
	const [errors, setErrors] = useState({});

	const [savedEducation, setSavedEducation] = useState({
		institution: "",
		location: "",
		startDate: "",
		endDate: "",
		qualification: "",
		specialization: "",
		skills: "",
		portfolio: "",
	});

	// Per-tab edit states
	const [isEditingPersonal, setIsEditingPersonal] = useState(false);
	const [isEditingEducation, setIsEditingEducation] = useState(false);
	const [isEditingExperience, setIsEditingExperience] = useState(false);
	const [isEditingBank, setIsEditingBank] = useState(false);
	const [isEditingDocs, setIsEditingDocs] = useState(false);

	// =========== GET USER ID ===========
	const getUserId = () => {
		return (
			localStorage.getItem("employee_user_id") ||
			localStorage.getItem("empId") ||
			localStorage.getItem("current_user_id")
		);
	};

	// =========== SAVE PROFILE TO BACKEND ===========
	const saveProfileToBackend = async (dataToSave) => {
		const userId = getUserId();
		try {
			const response = await apiClient.put(
				`/api/employee_profile/${userId}`,
				dataToSave,
				{
					headers: {
						"Content-Type": "application/json",
						"X-User-Role": "employee",
						"X-User-ID": userId.toString(),
					},
				},
			);
			return { success: true, data: response.data };
		} catch (error) {
			console.error("Error saving profile:", error);
			return {
				success: false,
				error: error.response?.data?.message || error.message,
			};
		}
	};

	// =========== FETCH DATA FROM BACKEND ===========
	const fetchEmployeeProfileData = async () => {
		try {
			const userId = getUserId();
			const response = await apiClient.get(`/employee_profile/${userId}`);

			// Only update with data from backend, use empty defaults if not provided
			if (response.data) {
				setProfile(response.data.profile || initialProfile);
				console.log("Employee profile data loaded successfully", response.data);

				// Map backend education field names to frontend state + parse skills JSON
				const edu = response.data.education || {};
				let parsedSkills = [];
				if (edu.skills) {
					if (Array.isArray(edu.skills)) {
						parsedSkills = edu.skills;
					} else {
						try {
							parsedSkills = JSON.parse(edu.skills);
						} catch (e) {
							parsedSkills = [];
						}
						if (!Array.isArray(parsedSkills)) parsedSkills = [];
					}
				}
				setEducation({
					institution: edu.institution || "",
					location: edu.location || "",
					startDate: edu.eduStartDate || "",
					endDate: edu.eduEndDate || "",
					qualification: edu.qualification || "",
					specialization: edu.specialization || "",
					skills: parsedSkills,
					portfolio: edu.portfolio || "",
				});

				// Map backend experience field names to frontend state
				const exp = response.data.experience || {};
				setExperience({
					company: exp.company || "",
					jobTitle: exp.jobTitle || "",
					startDate: exp.expStartDate || "",
					endDate: exp.expEndDate || "",
					responsibilities: exp.responsibilities || "",
					totalYears: exp.totalYears || "",
				});

				setBank(response.data.bank || initialBank);
				setDocuments(response.data.documents || initialDocs);
			}

			console.log("Employee profile data loaded successfully");
		} catch (error) {
			console.error("Error fetching employee profile data:", error);
			// Keep empty initial state on error
		}
	};

	useEffect(() => {
		fetchEmployeeProfileData();
	}, []);

	// =========== HANDLERS ===========
	const handleProfileChange = (e) => {
		//new
		const { name, value } = e.target;

		setProfile((prev) => ({ ...prev, [name]: value }));

		// Clear error for that field
		setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleEducationChange = (e) => {
		//new
		const { name, value } = e.target;

		setEducation((prev) => ({ ...prev, [name]: value }));

		setEducationErrors((prev) => ({ ...prev, [name]: "", form: "" }));
	};

	const handleExperienceChange = (e) => {
		//new
		const { name, value } = e.target;

		setExperience((prev) => {
			const updated = { ...prev, [name]: value };

			// Auto-calc years when dates change
			if (name === "startDate" || name === "endDate") {
				const calculatedYears = calculateExperienceYears(
					updated.startDate,
					updated.endDate,
				);

				if (calculatedYears !== "") {
					updated.totalYears = calculatedYears;
				}
			}

			return updated;
		});

		setExperienceErrors((prev) => ({ ...prev, [name]: "" }));
	};

	//handle bank change
	const handleBankChange = (e) => {
		const { name, value } = e.target;

		let newValue = value;

		// Allow only digits for numeric fields
		if (["accountNumber", "aadhaar"].includes(name)) {
			newValue = value.replace(/\D/g, "");
		}

		// PAN & IFSC should be uppercase
		if (["pan", "ifsc"].includes(name)) {
			newValue = value.toUpperCase();
		}

		setBank((prev) => ({ ...prev, [name]: newValue }));

		// Validation check
		if (validations[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: validations[name].test(newValue)
					? ""
					: `Invalid ${name.replace(/([A-Z])/g, " $1")}`,
			}));
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () =>
				setProfile((prev) => ({ ...prev, profileImage: reader.result }));
			reader.readAsDataURL(file);
		}
	};

	// const handleSkillChange = (e, idx) => {
	//   const newSkills = [...education.skills];
	//   newSkills[idx] = e.target.value;
	//   setEducation(prev => ({ ...prev, skills: newSkills }));
	// };

	// const addSkill = () => setEducation(prev => ({ ...prev, skills: [...prev.skills, ''] }));
	// const removeSkill = idx =>
	//   setEducation(prev => ({
	//     ...prev,
	//     skills: prev.skills.filter((_, sidx) => sidx !== idx)
	//   }));

	const handleSkillInputChange = (e) => {
		setSkillInput(e.target.value);
	};

	// addskill
	const addSkill = () => {
		if (!skillInput.trim()) return;

		// prevent duplicates
		if (education.skills.includes(skillInput.trim())) {
			setSkillInput("");
			return;
		}

		setEducation((prev) => ({
			...prev,
			skills: [...prev.skills, skillInput.trim()],
		}));

		setSkillInput("");
	};

	// removeskill
	const removeSkill = (idx) => {
		setEducation((prev) => ({
			...prev,
			skills: prev.skills.filter((_, i) => i !== idx),
		}));
	};

	// add skill on Enter key
	const handleSkillKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addSkill();
		}
	};

	const handleDocDelete = (idx) => {
		const docToDelete = documents[idx];
		if (docToDelete.id) {
			setDeletedDocIds((prev) => [...prev, docToDelete.id]);
		}
		setDocuments((prev) => prev.filter((_, didx) => didx !== idx));
	};

	//edit handle button for personal info
	const handleEditPersonal = () => {
		setPersonalBackup(profile); // save current profile
		setIsEditingPersonal(true);
	};

	//save handle button for personal info
	const handleSavePersonal = async () => {
		const isValid = validatePersonalInfo();
		if (!isValid) return;

		// Prepare data for backend (nested under "profile" section)
		const dataToSave = {
			profile: {
				gender: profile.gender,
				dob: profile.dob,
				maritalStatus: profile.maritalStatus,
				nationality: profile.nationality,
				bloodGroup: profile.bloodGroup,
				address: profile.address,
				emergencyContactNumber: profile.emergencyContactNumber,
				relationship: profile.relationship,
				profileImage: profile.profileImage, // Include image if updated
			},
		};

		const result = await saveProfileToBackend(dataToSave);

		if (result.success) {
			setPersonalBackup(profile);
			setIsEditingPersonal(false);
			setPersonalErrors({});
			alert("Profile updated successfully!");
		} else {
			alert(`Error saving profile: ${result.error}`);
		}
	};

	//cancel handle button for personal info
	const handleCancelPersonal = () => {
		setProfile(personalBackup); // restore previous values
		setPersonalErrors({});
		setIsEditingPersonal(false);
	};

	//save button for education tab

	const handleEditEducation = () => {
		setEducationBackup(education);
		setIsEditingEducation(true);
	};

	const handleSaveEducation = async () => {
		if (!validateEducation()) return;

		// Prepare data for backend with DB column names
		const dataToSave = {
			education: {
				institution: education.institution,
				location: education.location,
				startDate: education.startDate,
				endDate: education.endDate,
				qualification: education.qualification,
				specialization: education.specialization,
				skills: education.skills, // Backend handles list or string
				portfolio: education.portfolio,
			},
		};

		const result = await saveProfileToBackend(dataToSave);

		if (result.success) {
			setIsEditingEducation(false);
			setEducationErrors({});
			setSavedEducation(education);
			setEducationBackup(null);
			alert("Education Qualification updated successfully.");
		} else {
			alert(`Error saving education: ${result.error}`);
		}
	};

	const handleCancelEducation = () => {
		setEducation(educationBackup);
		setEducationErrors({});
		setIsEditingEducation(false);
	};

	//handleEditExperience for buttons
	const handleEditExperience = () => {
		setExperienceBackup(experience);
		setIsEditingExperience(true);
	};

	//handleCancelExperience
	const handleCancelExperience = () => {
		setExperience(experienceBackup);
		setExperienceErrors({});
		setIsEditingExperience(false);
	};

	//handleSaveExperience
	const handleSaveExperience = async () => {
		if (!validateExperience()) return;

		// Prepare data for backend with DB column names
		const dataToSave = {
			experience: {
				company: experience.company,
				jobTitle: experience.jobTitle,
				startDate: experience.startDate,
				endDate: experience.endDate,
				responsibilities: experience.responsibilities,
				totalYears: parseFloat(experience.totalYears) || 0,
			},
		};

		const result = await saveProfileToBackend(dataToSave);

		if (result.success) {
			setIsEditingExperience(false);
			setExperienceErrors({});
			setExperienceBackup(null);
			alert("Experience updated!");
		} else {
			alert(`Error saving experience: ${result.error}`);
		}
	};

	// handleSaveBank Save button logic

	const handleSaveBank = async () => {
		const isValid = validateBankForm();
		if (!isValid) return;

		// Prepare data for backend with DB column names
		const dataToSave = {
			bank: {
				bankName: bank.bankName,
				branch: bank.branch,
				accountNumber: bank.accountNumber,
				ifsc: bank.ifsc,
				aadhaar: bank.aadhaar,
				pan: bank.pan,
			},
		};

		const result = await saveProfileToBackend(dataToSave);

		if (result.success) {
			setSavedBank(bank);
			setIsEditingBank(false);
			alert("Bank details updated!");
		} else {
			alert(`Error saving bank details: ${result.error}`);
		}
	};

	const handleCancelBank = () => {
		setBank({
			bankName: "",
			branch: "",
			accountNumber: "",
			ifsc: "",
			aadhaar: "",
			pan: "",
		});

		setErrors({});
		setIsEditingBank(false);
	};

	const handleSaveDocs = async () => {
		const userId = getUserId();
		// Filter out documents that haven't been saved to backend yet (they have a 'file' property from selection)
		const newDocs = documents.filter((doc) => doc.file);

		if (newDocs.length === 0 && deletedDocIds.length === 0) {
			setIsEditingDocs(false);
			setDocumentsBackup(null);
			return;
		}

		try {
			// Delete documents marked for removal
			for (const docId of deletedDocIds) {
				await apiClient.delete(`/api/documents/${docId}`);
			}

			// For each new document, call the upload API
			for (const doc of newDocs) {
				await apiClient.post(
					"/api/documents",
					{
						user_id: userId,
						document_type: "Other", // Default type
						file_name: doc.fileName,
						file_size: parseInt(doc.size) * 1024,
						mime_type: doc.file.type || "application/pdf",
					},
					{
						headers: {
							"X-User-ID": userId.toString(),
						},
					},
				);
			}

			setIsEditingDocs(false);
			setDocumentsBackup(null);
			setDeletedDocIds([]);
			alert("Documents updated successfully!");
			// Dispatch event to notify other components (like Topbar)
			window.dispatchEvent(new Event("profileUpdated"));
			// Fetch fresh data to get updated list from backend
			fetchEmployeeProfileData();
		} catch (error) {
			console.error("Error saving documents:", error);
			alert(`Error saving documents: ${error.message}`);
		}
	};

	const handleCancelDocs = () => {
		if (documentsBackup) {
			setDocuments(documentsBackup);
		}
		setDeletedDocIds([]);
		setDocumentsBackup(null);
		setIsEditingDocs(false);
	};

	const handleEditDocs = () => {
		setDocumentsBackup([...documents]);
		setIsEditingDocs(true);
	};

	// const handleCancelBank = () => {
	//   setBank(savedBank);      // restore last saved data
	//   setErrors({});           // clear validation errors
	//   setIsEditingBank(false);
	// };

	// validation personal information
	const validatePersonalInfo = () => {
		const errors = {};

		// Gender
		if (!profile.gender) {
			errors.gender = "*Kindly select the gender.";
		}

		// Marital Status
		if (!profile.maritalStatus) {
			errors.maritalStatus = "*Kindly update your marital status.";
		}

		// DOB
		if (!profile.dob) {
			errors.dob = "*This field is required";
		}

		// Nationality
		if (!profile.nationality) {
			errors.nationality = "*This field is required";
		}

		// Blood Group
		if (!profile.bloodGroup) {
			errors.bloodGroup = "*This field is required";
		}

		// Emergency Contact Number
		if (!profile.emergencyContactNumber) {
			errors.emergencyContactNumber = "*This field is required";
		} else if (!/^[0-9]\d{9}$/.test(profile.emergencyContactNumber)) {
			errors.emergencyContactNumber = "*Please enter a valid phone number.";
		}

		// Address
		if (!profile.address) {
			errors.address = "*This field is required";
		}

		// Relationship
		if (!profile.relationship) {
			errors.relationship = "*This field is required";
		}

		setPersonalErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// validation for education tab                 new

	const validateEducation = () => {
		const errors = {};

		//mandatory feilds
		// if (!education.institution ||
		//     !education.startDate ||
		//     !education.endDate ||
		//     !education.qualification ||
		//     !education.specialization ||
		//     !education.portfolio) {
		//   errors.form = "Please fill all required fields.";
		// }

		// institution
		if (!education.institution) {
			errors.institution = "*This field is required";
		}

		// location
		if (!education.location) {
			errors.location = "*This field is required";
		}

		// Date validation

		// Required: Start Date
		if (!education.startDate) {
			errors.startDate = "Start Date is required.";
		}

		// Required: End Date
		if (!education.endDate) {
			errors.endDate = "End Date is required.";
		}

		if (education.startDate && education.endDate) {
			const start = new Date(education.startDate);
			const end = new Date(education.endDate);

			if (start > end) {
				errors.endDate = "End Date must be after Start Date.";
			}
		}
		// new
		if (!education.skills || education.skills.length === 0) {
			errors.skills = "At least one skill is required.";
		} else if (education.skills.some((skill) => !skill.trim())) {
			errors.skills = "Skill cannot be empty.";
		}
		// qualification
		if (!education.skills) {
			errors.skills = "*This field is required";
		}

		// qualification
		if (!education.qualification) {
			errors.qualification = "*This field is required";
		}

		// specialization
		if (!education.specialization) {
			errors.specialization = "*This field is required";
		}

		// portfolio
		if (!education.portfolio) {
			errors.portfolio = "*This field is required";
		} else {
			const urlRegex =
				/^(https?:\/\/)?(www\.)?(behance\.net|dribbble\.com|github\.com|linkedin\.com)\/.+$/i;

			if (!urlRegex.test(education.portfolio)) {
				errors.portfolio =
					"*Please enter a valid portfolio URL (Behance, Dribbble, GitHub, or LinkedIn)";
			}
		}

		setEducationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// validation for previous experience tab                 new

	const calculateExperienceYears = (startDate, endDate) => {
		if (!startDate || !endDate) return "";

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (start > end) return "";

		const diffTime = end - start;
		const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);

		return Number(diffYears.toFixed(1)); // 1 decimal (e.g., 2.5)
	};

	//validate Experience tab

	const validateExperience = () => {
		const errors = {};

		// Date validation
		if (experience.startDate && experience.endDate) {
			const start = new Date(experience.startDate);
			const end = new Date(experience.endDate);

			if (start > end) {
				errors.endDate = "End Date must be after Start Date.";
			} else {
				// Experience mismatch validation
				const calculated = calculateExperienceYears(
					experience.startDate,
					experience.endDate,
				);

				if (
					experience.totalYears &&
					Number(experience.totalYears) !== calculated
				) {
					errors.totalYears =
						"Mismatch between entered years of experience and provided dates.";
				}
			}
		}

		// company
		if (!experience.company) {
			errors.company = "*This field is required";
		}

		// jobtitle
		if (!experience.jobTitle) {
			errors.jobTitle = "*This field is required";
		}

		// job responsibilities
		if (!experience.responsibilities) {
			errors.responsibilities = "*This field is required";
		}

		// total experience
		if (!experience.totalYears) {
			errors.totalYears = "*This field is required";
		}

		// Date validation

		// Required: Start Date
		if (!experience.startDate) {
			errors.startDate = "Start Date is required.";
		}

		// Required: End Date
		if (!experience.endDate) {
			errors.endDate = "End Date is required.";
		}

		if (experience.startDate && experience.endDate) {
			const start = new Date(experience.startDate);
			const end = new Date(experience.endDate);

			if (start > end) {
				errors.endDate = "End Date must be after Start Date.";
			}
		}

		setExperienceErrors(errors);
		return Object.keys(errors).length === 0;
	};

	//validation for bank details

	const validations = {
		bankName: /^[a-zA-Z\s]{3,}$/, // Text only
		branch: /^[a-zA-Z0-9\s]{3,}$/, // Text + numbers
		accountNumber: /^\d{9,18}$/, // 9–18 digits
		ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/, // IFSC format
		aadhaar: /^\d{12}$/, // 12 digits
		pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format
	};

	const validateBankForm = () => {
		const newErrors = {};

		// Required checks
		if (!bank.bankName.trim()) {
			newErrors.bankName = "*This field is required";
		} else if (!validations.bankName.test(bank.bankName)) {
			newErrors.bankName = "Enter a valid bank name";
		}

		if (!bank.branch.trim()) {
			newErrors.branch = "*This field is required";
		} else if (!validations.branch.test(bank.branch)) {
			newErrors.branch = "Enter a valid branch name";
		}

		if (!bank.accountNumber) {
			newErrors.accountNumber = "*This field is required";
		} else if (!validations.accountNumber.test(bank.accountNumber)) {
			newErrors.accountNumber = "Account Number must be 9–18 digits";
		}

		if (!bank.ifsc) {
			newErrors.ifsc = "*This field is required";
		} else if (!validations.ifsc.test(bank.ifsc)) {
			newErrors.ifsc = "IFSC format: SBIN0001234";
		}

		if (!bank.aadhaar) {
			newErrors.aadhaar = "*This field is required";
		} else if (!validations.aadhaar.test(bank.aadhaar)) {
			newErrors.aadhaar = "Aadhaar must be 12 digits";
		}

		if (!bank.pan) {
			newErrors.pan = "*This field is required";
		} else if (!validations.pan.test(bank.pan)) {
			newErrors.pan = "PAN format: ABCDE1234F";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// =========== RENDER ===========
	return (
		<div className="dashboard-wrapper d-flex">
			<div className="sidebar">
				<EmployeeSidebar />
			</div>
			<div className="main-content flex-grow-1">
				<Topbar />
				<ProfileBanner profileData={profile} />

				{/* ------ Outer Card REMOVED! Tabs sit on main-content directly ---- */}
				<Tab.Container
					activeKey={activeTab}
					onSelect={(k) => setActiveTab(k)}
					defaultActiveKey="personal"
				>
					<Nav variant="tabs" className="profile-tabs">
						<Nav.Item>
							<Nav.Link eventKey="personal">Personal Information</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="education">Education Qualification</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="experience">
								Previous Experience (if any)
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="bank">Bank Details</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="documents">Documents</Nav.Link>
						</Nav.Item>
					</Nav>
					<Tab.Content>
						{/* PERSONAL INFORMATION */}
						<Tab.Pane eventKey="personal">
							<div className="update-info-header-box">
								<div className="tab-section-title personal-info d-flex align-items-center justify-content-between">
									<span>Update Personal Information</span>
									{!isEditingPersonal ? (
										<Button className="btn-edit" onClick={handleEditPersonal}>
											Edit
										</Button>
									) : (
										<div style={{ minWidth: 180, textAlign: "right" }}>
											<Button
												className="btn-cancel"
												onClick={handleCancelPersonal}
											>
												Cancel
											</Button>
											<Button className="btn-save" onClick={handleSavePersonal}>
												Save
											</Button>
										</div>
									)}
								</div>
							</div>
							<Form className="personal-info-form">
								<Row className="gy-4">
									<Col md={6}>
										<Form.Label className="form-label">Gender</Form.Label>
										<div className="option-box">
											<div className="d-flex gap-4 align-items-center">
												{["Male", "Female"].map((g) => (
													<Form.Check
														key={g}
														type="radio"
														disabled={!isEditingPersonal}
														label={g}
														name="gender"
														value={g}
														checked={profile.gender === g}
														onChange={handleProfileChange}
														className="form-radio"
													/>
												))}
											</div>
										</div>

										{/* new */}
										{personalErrors.gender && (
											<div className="error-text mt-1">
												{personalErrors.gender}
											</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">
											Marital Status
										</Form.Label>
										<div className="option-box">
											<div className="d-flex gap-4 align-items-center">
												{["Single", "Married"].map((m) => (
													<Form.Check
														key={m}
														type="radio"
														disabled={!isEditingPersonal}
														label={m}
														name="maritalStatus"
														value={m}
														checked={profile.maritalStatus === m}
														onChange={handleProfileChange}
														className="form-radio"
													/>
												))}
											</div>
										</div>
										{/* new */}
										{personalErrors.maritalStatus && (
											<div className="error-text mt-1">
												{personalErrors.maritalStatus}
											</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">
											Date Of Birth
										</Form.Label>
										<div className="input-icon-wrap">
											<Form.Control
												type="date"
												name="dob"
												value={profile.dob}
												onChange={handleProfileChange}
												className={`form-input ${personalErrors.dob ? "input-error" : ""
													}`}
												disabled={!isEditingPersonal}
											/>
											<span className="input-calendar-icon">
												<i className="bi bi-calendar3" />
											</span>
										</div>
										{/* new */}
										{personalErrors.dob && (
											<div className="error-text">{personalErrors.dob}</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">Nationality</Form.Label>
										<Form.Select
											name="nationality"
											value={profile.nationality}
											onChange={handleProfileChange}
											className={`form-select ${personalErrors.nationality ? "input-error" : ""
												}`}
											disabled={!isEditingPersonal}
										>
											<option value="" disabled>
												Select Your Nationality
											</option>
											<option value="India">India</option>
											<option value="Sri Lanka">Sri Lanka</option>
											<option value="Germany">Germany</option>
										</Form.Select>
										{/* new */}
										{personalErrors.nationality && (
											<div className="error-text">
												{personalErrors.nationality}
											</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">Blood Group</Form.Label>
										<Form.Select
											name="bloodGroup"
											value={profile.bloodGroup}
											onChange={handleProfileChange}
											className={`form-input ${personalErrors.bloodGroup ? "input-error" : ""
												}`}
											disabled={!isEditingPersonal}
										>
											<option value="" disabled>
												Select Blood Group
											</option>
											<option value="A+">A+</option>
											<option value="A-">A-</option>
											<option value="B+">B+</option>
											<option value="B-">B-</option>
											<option value="AB+">AB+</option>
											<option value="AB-">AB-</option>
											<option value="O+">O+</option>
											<option value="O-">O-</option>
										</Form.Select>
										{/* new */}
										{personalErrors.bloodGroup && (
											<div className="error-text">
												{personalErrors.bloodGroup}
											</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">
											Emergency Contact Number
										</Form.Label>
										<Form.Control
											type="text"
											name="emergencyContactNumber"
											value={profile.emergencyContactNumber}
											onChange={handleProfileChange}
											placeholder="Contact Number"
											className={`form-input ${personalErrors.emergencyContactNumber
													? "input-error"
													: ""
												}`}
											disabled={!isEditingPersonal}
										/>
										{personalErrors.emergencyContactNumber && (
											<div className="error-text">
												{personalErrors.emergencyContactNumber}
											</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">Address</Form.Label>
										<Form.Control
											type="text"
											name="address"
											value={profile.address}
											onChange={handleProfileChange}
											placeholder="Home Address"
											className={`form-input ${personalErrors.address ? "input-error" : ""}`}
											disabled={!isEditingPersonal}
										/>
										{personalErrors.address && (
											<div className="error-text">{personalErrors.address}</div>
										)}
									</Col>
									<Col md={6}>
										<Form.Label className="form-label">
											Relationship with Emergency Contact
										</Form.Label>
										<Form.Select
											// type="text"
											name="relationship"
											value={profile.relationship}
											onChange={handleProfileChange}
											placeholder="Emergency Contact Person"
											className={`form-input ${personalErrors.relationship ? "input-error" : ""}`}
											disabled={!isEditingPersonal}
										>
											<option value="" disabled>
												Select Relation contact
											</option>
											<option value="Husband">Husband</option>
											<option value="Wife">Wife</option>
											<option value="Father">Father</option>
											<option value="Mother">Mother</option>
										</Form.Select>
										{/* new */}
										{personalErrors.relationship && (
											<div className="error-text">
												{personalErrors.relationship}
											</div>
										)}
									</Col>
								</Row>
							</Form>
						</Tab.Pane>

						{/* EDUCATION TAB */}
						<Tab.Pane eventKey="education">
							<div className="update-info-header-box">
								<div className="tab-section-title personal-info d-flex align-items-center justify-content-between">
									<span>Update Educational Qualification</span>
									{!isEditingEducation ? (
										<Button className="btn-edit" onClick={handleEditEducation}>
											Edit
										</Button>
									) : (
										<div style={{ minWidth: 180, textAlign: "right" }}>
											<Button
												className="btn-cancel"
												onClick={handleCancelEducation}
											>
												Cancel
											</Button>
											<Button
												className="btn-save"
												onClick={handleSaveEducation}
											>
												Save
											</Button>
										</div>
									)}
								</div>
							</div>
							<div className="profile-tab-section education">
								<Form>
									<Row className="gy-4">
										<Col md={6}>
											<Form.Group>
												<Form.Label className="form-label">
													Name Of the Institution
												</Form.Label>
												<Form.Control
													type="text"
													name="institution"
													value={education.institution}
													onChange={handleEducationChange}
													placeholder="Institution Name"
													className={`pexform-input ${educationErrors.institution ? "input-error1" : ""}`}
													disabled={!isEditingEducation}
												/>
												{/* new */}
												{educationErrors.institution && (
													<div className="error-text1">
														{educationErrors.institution}
													</div>
												)}
											</Form.Group>
											<Form.Group>
												<Form.Label className="form-label">
													Start Date
												</Form.Label>
												<div className="calendar-input-wrap">
													<Form.Control
														type="date"
														name="startDate"
														value={education.startDate}
														onChange={handleEducationChange}
														className={`pexform-input ${educationErrors.startDate ? "input-error1" : ""}`}
														disabled={!isEditingEducation}
													/>
													{/* new */}
													{educationErrors.startDate && (
														<div className="error-text1">
															{educationErrors.startDate}
														</div>
													)}
													<span className="calendar-icon">
														<i className="bi bi-calendar3"></i>
													</span>
												</div>
											</Form.Group>
											<Form.Group>
												<Form.Label className="form-label">
													Qualification
												</Form.Label>
												<Form.Select
													name="qualification"
													value={education.qualification}
													onChange={handleEducationChange}
													placeholder="Qualification"
													className={`edform-input ${educationErrors.qualification ? "input-error1" : ""}`}
													disabled={!isEditingEducation}
												>
													<option value="" disabled>
														Education Qualification
													</option>
													<option value="BE">BE</option>
													<option value="BSC">B.SC(computer science)</option>
													<option value="BCOM">B.COM(computer science)</option>
												</Form.Select>
												{/* new */}
												{educationErrors.qualification && (
													<div className="error-text1">
														{educationErrors.qualification}
													</div>
												)}
											</Form.Group>
											<Form.Group>
												<Form.Label className="form-label">Skills</Form.Label>
												{/* Skill Input + Add Button */}
												<div className="skill-input-wrap">
													<Form.Control
														type="text"
														placeholder="Add a skill"
														value={skillInput}
														onChange={handleSkillInputChange}
														onKeyDown={handleSkillKeyDown}
														className="skill-input"
														disabled={!isEditingEducation}
													/>
													<button
														type="button"
														className="skill-add-btn"
														onClick={addSkill}
														disabled={!isEditingEducation}
													>
														+
													</button>
												</div>
												<div className="skills-pill-wrap">
													{education.skills.map((skill, i) => (
														<span className="skill-pill" key={i}>
															{skill}
															<span
																className="skill-remove"
																onClick={() => removeSkill(i)}
															>
																×
															</span>
														</span>
													))}
												</div>{" "}
												{/* new */}
												{educationErrors.skills && (
													<div className="error-text">
														{educationErrors.skills}
													</div>
												)}
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group>
												<Form.Label className="form-label">Location</Form.Label>
												<Form.Control
													type="text"
													name="location"
													value={education.location}
													onChange={handleEducationChange}
													placeholder="Location"
													className={`pexform-input1 ${educationErrors.location ? "input-error1" : ""}`}
													disabled={!isEditingEducation}
												/>
												{/* new */}
												{educationErrors.location && (
													<div className="error-text1">
														{educationErrors.location}
													</div>
												)}
												<Form.Label className="form-label">End Date</Form.Label>
												<div className="calendar-input-wrap">
													<Form.Control
														type="date"
														name="endDate"
														value={education.endDate}
														onChange={handleEducationChange}
														className={`pexform-input ${educationErrors.endDate ? "input-error1" : ""}`}
														disabled={!isEditingEducation}
													/>
													{educationErrors.endDate && (
														<div className="error-text1">
															{educationErrors.endDate}
														</div>
													)}
													<span className="calendar-icon">
														<i className="bi bi-calendar3"></i>
													</span>
												</div>
											</Form.Group>
											<Form.Group>
												<Form.Label className="form-label">
													Specialization
												</Form.Label>
												<Form.Select
													name="specialization"
													value={education.specialization}
													onChange={handleEducationChange}
													placeholder="Specialization"
													className={`edform-input ${educationErrors.specialization ? "input-error1" : ""}`}
													disabled={!isEditingEducation}
												>
													<option value="" disabled>
														Specialization
													</option>
													<option value="Cloud-computing">
														Cloud computing
													</option>
													<option value="Data-Science">Data Science</option>
													<option value="Cyber-Security">Cyber Security</option>
												</Form.Select>
												{/* new */}
												{educationErrors.specialization && (
													<div className="error-text1">
														{educationErrors.specialization}
													</div>
												)}
											</Form.Group>
											<Form.Group>
												<Form.Label className="form-label">
													Portfolio Link
												</Form.Label>
												<Form.Control
													type="text"
													name="portfolio"
													value={education.portfolio}
													onChange={handleEducationChange}
													placeholder="Portfolio Link"
													disabled={!isEditingEducation}
													className={`form-input ${educationErrors.portfolio ? "input-error" : ""}`}
												/>
												{educationErrors.portfolio && (
													<div className="error-text1">
														{educationErrors.portfolio}
													</div>
												)}
											</Form.Group>
										</Col>
									</Row>
								</Form>
							</div>
						</Tab.Pane>

						{/* EXPERIENCE TAB */}
						<Tab.Pane eventKey="experience">
							<div className="update-info-header-box">
								<div className="tab-section-title personal-info d-flex align-items-center justify-content-between">
									<span>Update Previous Experience (if any)</span>
									{!isEditingExperience ? (
										<Button className="btn-edit" onClick={handleEditExperience}>
											Edit
										</Button>
									) : (
										<div style={{ minWidth: 180, textAlign: "right" }}>
											<Button
												className="btn-cancel"
												onClick={handleCancelExperience}
											>
												Cancel
											</Button>
											<Button
												className="btn-save"
												onClick={handleSaveExperience}
											>
												Save
											</Button>
										</div>
									)}
								</div>
							</div>
							<div className="profile-tab-section experience">
								<Form>
									<Row className="gy-4">
										<Col md={6}>
											<Form.Label>Name Of the Company</Form.Label>
											<Form.Control
												type="text"
												name="company"
												value={experience.company}
												onChange={handleExperienceChange}
												placeholder="Company Name"
												className={`pexform-input ${experienceErrors.company ? "input-error1" : ""}`}
												disabled={!isEditingExperience}
											/>
											{experienceErrors.company && (
												<div className="error-text1">
													{experienceErrors.company}
												</div>
											)}
											<Form.Label className="form-label">Start Date</Form.Label>
											<div className="calendar-input-wrap">
												<Form.Control
													type="date"
													name="startDate"
													value={experience.startDate}
													onChange={handleExperienceChange}
													className={`pexform-input ${experienceErrors.startDate ? "input-error1" : ""}`}
													disabled={!isEditingExperience}
												/>
												{experienceErrors.startDate && (
													<div className="error-text1">
														{experienceErrors.startDate}
													</div>
												)}
												<span className="calendar-icon">
													<i className="bi bi-calendar3"></i>
												</span>
											</div>
											<Form.Label>Job Responsibilities</Form.Label>
											<Form.Control
												as="textarea"
												name="responsibilities"
												value={experience.responsibilities}
												onChange={handleExperienceChange}
												placeholder="Describe your job responsibilities"
												className={`pexform-input2 ${experienceErrors.responsibilities ? "input-error" : ""}`}
												disabled={!isEditingExperience}
											/>
											{experienceErrors.responsibilities && (
												<div className="error-text">
													{experienceErrors.responsibilities}
												</div>
											)}
										</Col>
										<Col md={6}>
											<Form.Label>Job Title / Designation</Form.Label>
											<Form.Control
												type="text"
												name="jobTitle"
												value={experience.jobTitle}
												onChange={handleExperienceChange}
												placeholder="Job Title"
												className={`pexform-input1 ${experienceErrors.jobTitle ? "input-error1" : ""}`}
												disabled={!isEditingExperience}
											/>
											{experienceErrors.jobTitle && (
												<div className="error-text1">
													{experienceErrors.jobTitle}
												</div>
											)}
											<Form.Label className="form-label">End Date</Form.Label>
											<div className="calendar-input-wrap">
												<Form.Control
													type="date"
													name="endDate"
													value={experience.endDate}
													onChange={handleExperienceChange}
													className={`pexform-input ${experienceErrors.endDate ? "input-error1" : ""}`}
													disabled={!isEditingExperience}
												/>
												{experienceErrors.endDate && (
													<div className="error-text1">
														{experienceErrors.endDate}
													</div>
												)}
												<span className="calendar-icon">
													<i className="bi bi-calendar3"></i>
												</span>{" "}
											</div>
											<Form.Label>Total Years Of Experience</Form.Label>
											<Form.Control
												type="number"
												step="0.1"
												name="totalYears"
												value={experience.totalYears}
												onChange={handleExperienceChange}
												placeholder="Experience in Years"
												className={`pexform-input ${experienceErrors.totalYears ? "input-error1" : ""}`}
												disabled={!isEditingExperience}
											/>
											{experienceErrors.totalYears && (
												<div className="error-text1">
													{experienceErrors.totalYears}
												</div>
											)}
										</Col>
									</Row>
								</Form>
							</div>
						</Tab.Pane>

						{/* BANK DETAILS TAB */}
						<Tab.Pane eventKey="bank">
							<div className="update-info-header-box">
								<div className="tab-section-title personal-info d-flex align-items-center justify-content-between">
									<span>Update Bank Details</span>
									{!isEditingBank ? (
										<Button
											className="btn-edit"
											onClick={() => setIsEditingBank(true)}
										>
											Edit
										</Button>
									) : (
										<div style={{ minWidth: 180, textAlign: "right" }}>
											<Button className="btn-cancel" onClick={handleCancelBank}>
												Cancel
											</Button>
											<Button className="btn-save" onClick={handleSaveBank}>
												Save
											</Button>
										</div>
									)}
								</div>
							</div>
							<div className="profile-tab-section bank-details">
								<Form>
									<Row className="gy-4">
										<Col md={6}>
											<Form.Label>Bank Name</Form.Label>
											<Form.Control
												type="text"
												name="bankName"
												value={bank.bankName}
												onChange={handleBankChange}
												placeholder="Name of the Bank"
												disabled={!isEditingBank}
												className={`form-input ${errors.bankName ? "input-error" : ""}`}
											/>
											{errors.bankName && (
												<div className="error-text">{errors.bankName}</div>
											)}
										</Col>
										<Col md={6}>
											<Form.Label>Branch</Form.Label>
											<Form.Control
												type="text"
												name="branch"
												value={bank.branch}
												onChange={handleBankChange}
												placeholder="Name of the Branch"
												disabled={!isEditingBank}
												className={`form-input ${errors.branch ? "input-error" : ""}`}
											/>
											{errors.branch && (
												<div className="error-text">{errors.branch}</div>
											)}
										</Col>
										<Col md={6}>
											<Form.Label>Account Number</Form.Label>
											<Form.Control
												type="text"
												name="accountNumber"
												value={bank.accountNumber}
												onChange={handleBankChange}
												placeholder="Bank AC Number"
												disabled={!isEditingBank}
												className={`form-input ${errors.accountNumber ? "input-error" : ""}`}
											/>
											{errors.accountNumber && (
												<div className="error-text">{errors.accountNumber}</div>
											)}
										</Col>
										<Col md={6}>
											<Form.Label>IFSC Code</Form.Label>
											<Form.Control
												type="text"
												name="ifsc"
												value={bank.ifsc}
												onChange={handleBankChange}
												placeholder="IFSC Code"
												disabled={!isEditingBank}
												className={`form-input ${errors.ifsc ? "input-error" : ""}`}
											/>
											{errors.ifsc && (
												<div className="error-text">{errors.ifsc}</div>
											)}
										</Col>
										<Col md={6}>
											<Form.Label>Aadhaar Number</Form.Label>
											<Form.Control
												type="text"
												name="aadhaar"
												value={bank.aadhaar}
												onChange={handleBankChange}
												placeholder="XXXX-XXXX-XXXX"
												disabled={!isEditingBank}
												className={`form-input ${errors.aadhaar ? "input-error" : ""}`}
											/>
											{errors.aadhaar && (
												<div className="error-text">{errors.aadhaar}</div>
											)}
										</Col>
										<Col md={6}>
											<Form.Label>PAN Number</Form.Label>
											<Form.Control
												type="text"
												name="pan"
												value={bank.pan}
												onChange={handleBankChange}
												placeholder="ABCDE1234F"
												disabled={!isEditingBank}
												className={`form-input ${errors.pan ? "input-error" : ""}`}
											/>
											{errors.pan && (
												<div className="error-text">{errors.pan}</div>
											)}
										</Col>
									</Row>
								</Form>
							</div>
						</Tab.Pane>

						{/* DOCUMENTS TAB */}
						<Tab.Pane eventKey="documents">
							<div className="update-info-header-box">
								<div className="tab-section-title personal-info d-flex align-items-center justify-content-between">
									<span>Update Documents</span>
									{!isEditingDocs ? (
										<Button className="btn-edit" onClick={handleEditDocs}>
											Edit
										</Button>
									) : (
										<div style={{ minWidth: 180, textAlign: "right" }}>
											<Button className="btn-cancel" onClick={handleCancelDocs}>
												Cancel
											</Button>
											<Button className="btn-save" onClick={handleSaveDocs}>
												Save
											</Button>
										</div>
									)}
								</div>
							</div>
							<div className="profile-tab-section documents">
								<Row className="align-items-start g-3">
									<Col md={7}>
										{documents.map((doc, idx) => (
											<div
												className="doc-item mb-3 d-flex flex-row align-items-center p-3"
												key={idx}
											>
												<span className="pdf-icon me-3">
													PDF
												</span>
												<div className="flex-grow-1 overflow-hidden">
													<h6 className="mb-0 text-truncate doc-title">
														{doc.fileName || doc.name}
													</h6>
													<div className="d-flex align-items-center mt-1">
														<span className="doc-size-text">
															{doc.size || "94"} KB of {doc.size || "94"} KB
															&nbsp;•&nbsp;
														</span>
														<span className="ms-1 status-completed-text">
															<i className="bi bi-check-circle-fill me-1"></i>{" "}
															Completed
														</span>
													</div>
												</div>
												<Button
													variant="ghost"
													className="p-1 px-2 ms-2 doc-delete-btn"
													onClick={() => handleDocDelete(idx)}
													disabled={!isEditingDocs}
												>
													<i className="bi bi-trash3"></i>
												</Button>
											</div>
										))}
									</Col>
									<Col md={5}>
										<div
											onDragOver={(e) => {
												e.preventDefault();
												setIsDragOver(true);
											}}
											onDragLeave={() => setIsDragOver(false)}
											onDrop={(e) => {
												e.preventDefault();
												setIsDragOver(false);
												if (
													e.dataTransfer.files &&
													e.dataTransfer.files.length > 0
												) {
													const newDocs = Array.from(e.dataTransfer.files).map(
														(f) => ({
															name: f.name,
															fileName: f.name,
															size: (f.size / 1024).toFixed(0),
															status: "Completed",
															file: f,
														}),
													);
													setDocuments((prev) => [...prev, ...newDocs]);
												}
											}}
											className={`upload-box ${isDragOver ? "drag-over" : ""}`}
										>
											<div style={{ marginBottom: "16px" }}>
												<i
													className="bi bi-cloud-arrow-up"
													style={{ fontSize: "3.5rem", color: "#19BDE8" }}
												></i>
											</div>
											<p className="upload-title">
												Choose a file or drag &amp; drop it here
											</p>
											<p className="upload-hint">
												JPEG, PNG, PDF, and MP4 formats, up to 50MB
											</p>
											<input
												id="employee-file-upload"
												type="file"
												style={{ display: "none" }}
												multiple
												onChange={(e) => {
													if (!e.target.files) return;
													const newDocs = Array.from(e.target.files).map(
														(f) => ({
															name: f.name,
															fileName: f.name,
															size: (f.size / 1024).toFixed(0),
															status: "Completed",
															file: f,
														}),
													);
													setDocuments((prev) => [...prev, ...newDocs]);
													e.target.value = "";
												}}
											/>
											<label
												htmlFor="employee-file-upload"
												className="browse-file-label"
											>
												Browse File
											</label>
										</div>
									</Col>
								</Row>
							</div>
						</Tab.Pane>
					</Tab.Content>
				</Tab.Container>
			</div>
		</div>
	);
};

export default EmployeeProfile;
