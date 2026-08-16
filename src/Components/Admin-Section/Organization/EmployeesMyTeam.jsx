import React, { useState, useEffect, useContext } from "react";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import "./EmployeesMyTeam.css";
import { FaUserFriends, FaFilter, FaSearch, FaEdit } from "react-icons/fa";
import group10 from "../../../assets/Group10.png";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../../utils/apiClient";
import { SettingsContext } from "../../Employee-Section/Settings-/SettingsContext";

const Employee = () => {
	const [showModal, setShowModal] = useState(false);
	const [employees, setEmployees] = useState([]);
	const [errors, setErrors] = useState({});
	const { fmtDate } = useContext(SettingsContext);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("newest");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({});
	const [profileImage, setProfileImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [staffList, setStaffList] = useState([]);
	const [filters, setFilters] = useState({
		department: "all",
		position: "all",
		status: "all",
	});
	const [showProfileModal, setShowProfileModal] = useState(false);

	const location = useLocation();
	const highlightName = location.state?.highlightName || "";
	const navigate = useNavigate();

	// ─── handleChange ────────────────────────────────────────────
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// ─── handleImageChange ───────────────────────────────────────
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 4 * 1024 * 1024) {
				alert("Image should be below 4 MB");
				return;
			}
			setProfileImage(file);
			setPreviewImage(URL.createObjectURL(file));
		}
	};

	// ─── handleEditClick (original logic, unchanged) ─────────────
	const handleEditClick = () => {
		if (!selectedEmployee) return;

		const profile = selectedEmployee.profile || {};
		const education = selectedEmployee.education || {};

		const formatDate = (dateStr) => {
			if (!dateStr || dateStr === "Not Set" || dateStr === "N/A") return "";
			if (dateStr.includes("-")) return dateStr;
			const parts = dateStr.split("/");
			if (parts.length === 3) {
				return `${parts[2]}-${parts[1]}-${parts[0]}`;
			}
			return "";
		};

		setFormData({
			firstName: profile.first_name || "",
			lastName: profile.last_name || "",
			employeeId: profile.empId || "",
			joiningDate: formatDate(profile.joiningDate),
			email: profile.email || "",
			phone: profile.phone || "",
			employmentType: profile.empType || "",
			supervisor: profile.supervisor || "",
			hrManager: profile.hrManager || "",
			department: profile.department || "",
			designation: profile.position || "",
			gender: profile.gender || "",
			dob: formatDate(profile.dob),
			bloodGroup: profile.bloodGroup || "",
			maritalStatus: profile.maritalStatus || "",

			portfolioLink: education.portfolio || "",
			institution: education.institution || "",
			eduStartDate: formatDate(education.eduStartDate),
			eduEndDate: formatDate(education.eduEndDate),
			course: education.qualification || "",
			specialization: education.specialization || "",
			skills: Array.isArray(education.skills)
				? education.skills.join(", ")
				: education.skills || "",

			status: profile.status || "Active",
		});

		setEditingId(profile.id);
		setPreviewImage(profile.profile_image || null);
		setIsEditing(true);
		setShowProfileModal(false);
		setShowModal(true);
	};

	// ─── handleSubmit (original logic, unchanged) ────────────────
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (isEditing && !editingId) {
			alert("Edit ID missing ❌");
			return;
		}

		try {
			// Always use FormData so image file is sent as multipart
			const payload = new FormData();
			Object.keys(formData).forEach((key) => {
				payload.append(key, formData[key] ?? "");
			});
			if (profileImage) {
				payload.append("profileImage", profileImage);
			}

			if (isEditing) {
				await apiClient.put(`/admin_profile/${editingId}`, formData, {
					headers: {
						"X-User-Role": localStorage.getItem("current_role"),
						"X-User-ID": localStorage.getItem("current_user_id"),
					},
				});
				alert("Employee updated successfully ✅");
			} else {
				await apiClient.post("/api/add_employee", formData);
				alert("Employee added successfully ✅");
			}
			setShowModal(false);
			setIsEditing(false);
			setProfileImage(null);
			// Reload so updated image/data is reflected in the list
			window.location.reload();
		} catch (error) {
			console.error("Error saving employee:", error);
			alert("Something went wrong ❌");
		}
	};

	// ─── handleViewDetails ───────────────────────────────────────
	const handleViewDetails = async (emp) => {
		try {
			const response = await apiClient.get(`/admin_profile/${emp.id}`, {
				headers: {
					"X-User-Role": localStorage.getItem("current_role"),
					"X-User-ID": localStorage.getItem("current_user_id"),
				},
			});
			console.log("FULL API DATA:", response.data);

			setSelectedEmployee({ ...response.data, listImage: emp.image });
			setShowProfileModal(true);
			setIsEditing(false); // ✅ reset
			setShowModal(false); // ✅ ensure edit modal closed
		} catch (error) {
			console.error("Error fetching full profile:", error);
			alert("Could not load employee details.");
		}
	};

	const closeProfileModal = () => {
		setShowProfileModal(false);
		setSelectedEmployee(null);
	};

	// ─── Destructure API data ────────────────────────────────────
	const profile = selectedEmployee?.profile || {};
	const education = selectedEmployee?.education || {};
	const experience = selectedEmployee?.experience || {};
	const bank = selectedEmployee?.bank || {};
	const documents = selectedEmployee?.documents || [];

	// ─── Fetch team ──────────────────────────────────────────────
	useEffect(() => {
		const fetchTeam = async () => {
			try {
				setLoading(true);
				const response = await apiClient.get(`/api/my_team`, {
					headers: {
						"X-User-Role": localStorage.getItem("current_role"),
						"X-User-ID": localStorage.getItem("current_user_id"),
					},
				});
				console.log(response.data);
				const teamData = response.data.map((member, index) => ({
					...member,
					empId: member.empId || String(member.id).padStart(6, "0"),
					DateOfJoining: member.joining_date
						? fmtDate(member.joining_date) ||
						new Date(member.joining_date).toLocaleDateString("en-GB")
						: "-",
					status: member.status || "Active",
					image: member.image,
				}));
				setEmployees(teamData);
			} catch (error) {
				console.error("Error fetching team:", error);
				setEmployees([]);
			} finally {
				setLoading(false);
			}
		};
		fetchTeam();
	}, []);

	// Fetch staff list for supervisor / HR manager dropdowns
	useEffect(() => {
		const fetchStaff = async () => {
			try {
				const response = await apiClient.get("/api/staff_list");
				setStaffList(response.data);
			} catch (error) {
				console.error("Error fetching staff list:", error);
			}
		};
		fetchStaff();
	}, []);

	const baseEmployees = highlightName
		? employees.filter((emp) =>
			emp.name.toLowerCase().includes(highlightName.toLowerCase()),
		)
		: employees;

	const searchedEmployees = baseEmployees.filter((emp) =>
		`${emp.name} ${emp.email} ${emp.empId}`
			.toLowerCase()
			.includes(searchTerm.toLowerCase()),
	);

	const filteredEmployee = searchedEmployees.filter((emp) => {
		return (
			(filters.department === "all" || emp.department === filters.department) &&
			(filters.position === "all" || emp.position === filters.position) &&
			(filters.status === "all" || emp.status === filters.status)
		);
	});

	const sortedEmployees = [...filteredEmployee].sort((a, b) => {
		switch (sortBy) {
			case "name":
				return a.name.localeCompare(b.name);
			case "department":
				return a.department.localeCompare(b.department);
			case "status":
				return a.status.localeCompare(b.status);
			case "newest":
				return (b.id ?? 0) - (a.id ?? 0);
			case "oldest":
				return (a.id ?? 0) - (b.id ?? 0);
			default:
				return 0;
		}
	});

	// ─────────────────────────────────────────────────────────────
	// RENDER
	// ─────────────────────────────────────────────────────────────
	return (
		<div className="employee-page">
			<div className="rightside-logo">
				<img src={group10} alt="logo" className="rightside-logos" />
			</div>

			<AdminSidebar />

			<div className="employee-main">
				<Topbar />

				{/* ── Page header / filters ── */}
				<div className="employee-content">
					<div className="employee-header">
						{/* LEFT */}
						<div className="header-left">
							<h2>My Team</h2>

							<div className="emplt-top-buttons">
								<button
									className="emplt-btn-apply"
									onClick={() => navigate("/employees-list")}
								>
									All Employee
								</button>
								<button className="emplt-btn-regularization active">
									My Team
								</button>
							</div>

							<div className="search-containerr1">
								<FaSearch className="search-iconn1" size={16} />
								<input
									type="text"
									placeholder="Search..."
									className="search-inputt1"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>

						{/* RIGHT */}
						<div className="header-right1">
							<div className="filter-sort">
								<div className="filter-wrapper">
									<button
										className="right-butn-filterr"
										onClick={() => setShowFilters((prev) => !prev)}
									>
										<FaFilter /> Filter
									</button>

									{showFilters && (
										<div className="filter-dropdown">
											<h4>Filter</h4>

											<div className="filter-field">
												<label>Name</label>
												<input
													type="text"
													placeholder="Please enter name"
													value={searchTerm}
													onChange={(e) => setSearchTerm(e.target.value)}
												/>
											</div>

											<div className="filter-row">
												<div className="filter-field">
													<label>Department</label>
													<select
														value={filters.department}
														onChange={(e) =>
															setFilters({
																...filters,
																department: e.target.value,
															})
														}
													>
														<option value="all">Select</option>
														<option value="Human Resource">
															Human Resource
														</option>
														<option value="Development">Development</option>
														<option value="Design">Design</option>
														<option value="Sales">Sales</option>
													</select>
												</div>
												<div className="filter-field">
													<label>Position</label>
													<select
														value={filters.position}
														onChange={(e) =>
															setFilters({
																...filters,
																position: e.target.value,
															})
														}
													>
														<option value="all">Select</option>
														<option value="Project Head">Project Head</option>
														<option value="Designer">Designer</option>
														<option value="Developer">Developer</option>
														<option value="UIUX">UIUX</option>
													</select>
												</div>
											</div>

											<div className="filter-actions">
												<button
													className="reset-btn"
													onClick={() => {
														setFilters({
															name: "",
															department: "all",
															position: "all",
															status: "all",
														});
														setSearchTerm("");
														setShowFilters(false);
													}}
												>
													Reset
												</button>
												<button
													className="apply-btn"
													onClick={() => setShowFilters(false)}
												>
													Apply
												</button>
											</div>
										</div>
									)}
								</div>

								<select
									className="sort-select1"
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
								>
									<option value="newest">Sort By : Newest</option>
									<option value="oldest">Sort By : Oldest</option>
									<option value="name">Sort By : Name</option>
									<option value="department">Sort By : Department</option>
								</select>
							</div>
						</div>
					</div>

					{/* ── Table ── */}
					{loading ? (
						<div className="text-center py-4">
							<p>Loading team members...</p>
						</div>
					) : (
						<table className="employee-table">
							<thead>
								<tr>
									<th>Name/Email ID</th>
									<th>Employee ID</th>
									<th>Date Of Joining</th>
									<th>Department</th>
									<th>Position</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{sortedEmployees.map((emp) => (
									<tr key={emp.id}>
										<td>
											<div className="emp-info">
												<img
													src={emp.image}
													alt={emp.name}
													className="emp-img"
												/>
												<div>
													<p className="emp-name">{emp.name}</p>
													<p className="emp-email">{emp.email}</p>
												</div>
											</div>
										</td>
										<td>{emp.empId}</td>
										<td>{emp.DateOfJoining}</td>
										<td>{emp.department}</td>
										<td>{emp.position}</td>
										<td>
											<button
												className="view-btn"
												onClick={() => handleViewDetails(emp)}
											>
												View Details
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					{/* ── Pagination ── */}
					<div className="pagination">
						<div className="showing">
							Showing{" "}
							<select>
								<option>07</option>
								<option>10</option>
								<option>15</option>
							</select>
						</div>
						<div className="page-nav">
							<button>Prev</button>
							<span className="page-num">01</span>
							<button>Next</button>
						</div>
					</div>
				</div>

				{showProfileModal && selectedEmployee && (
					<div className="profile-overlay-fixed" onClick={closeProfileModal}>
						<div className="mt-profile-modal-container" onClick={(e) => e.stopPropagation()}>
							<div className="profile-modal-header">
								<button className="modal-close-times" onClick={closeProfileModal}>×</button>
							</div>

							<div className="profile-modal-scrollable">
								{/* ROW 1: Profile Image + Employment + Personal + Educational */}
								<div className="mt-profile-grid-row">
									{/* Column 1: Profile Image */}
									<div className="mt-profile-image-section">
										<div className="mt-profile-header-inline">
											<h3 className="mt-profile-main-title">Profile</h3>
											<div className="mt-profile-edit-badge" onClick={(e) => { e.stopPropagation(); handleEditClick(); }}>
												<FaEdit size={14} />
											</div>
											<div className="mt-profile-status-badge">
												<span className="mt-status-dot"></span>
												<span className="mt-status-label">Active</span>
											</div>
										</div>
										<div className="mt-profile-card-container">
											<div className="mt-profile-image-box">
												<div className="mt-profile-circular-mask">
													<img
														src={profile.profile_image || profile.profileImage || selectedEmployee.listImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || selectedEmployee.name || "User")}&background=random`}
														alt={selectedEmployee.name}
														className="mt-profile-modal-img"
													/>
												</div>
											</div>
											<div className="mt-profile-name-tag">
												{selectedEmployee.name}&nbsp;(ID&nbsp;{profile.empId || selectedEmployee.empId})
											</div>
										</div>
									</div>

									{/* Column 2: Employment Details */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Employment Details</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Position</label>
											<p className="mt-field-value">{profile.position || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Employment Type</label>
											<p className="mt-field-value">{profile.empType || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Primary Supervisor</label>
											<p className="mt-field-value">{profile.supervisor || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Department</label>
											<p className="mt-field-value">{profile.department || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">HR Manager</label>
											<p className="mt-field-value">{profile.hrManager || "—"}</p>
										</div>
									</div>

									{/* Column 3: Personal Details */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Personal Details</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Gender</label>
											<p className="mt-field-value">{profile.gender || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Date of Birth</label>
											<p className="mt-field-value">{profile.dob || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Blood Group</label>
											<p className="mt-field-value">{profile.bloodGroup || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Marital Status</label>
											<p className="mt-field-value">{profile.maritalStatus || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Portfolio Link</label>
											<p className="mt-field-value">
												<a href={education.portfolio || "#"} style={{ color: 'inherit', textDecoration: 'none' }}>
													{education.portfolio || "—"}
												</a>
											</p>
										</div>
									</div>

									{/* Column 4: Educational Qualification */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Educational Qualification</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Name Of the Institution</label>
											<p className="mt-field-value">{education.institution || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Start &amp; Enddate</label>
											<p className="mt-field-value">
												{education.eduStartDate && education.eduEndDate ? `${education.eduStartDate}-${education.eduEndDate}` : "—"}
											</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Course</label>
											<p className="mt-field-value">{education.qualification || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Specialization</label>
											<p className="mt-field-value">{education.specialization || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Skills</label>
											<p className="mt-field-value">{Array.isArray(education.skills) ? education.skills.join(", ") : (education.skills || "—")}</p>
										</div>
									</div>
								</div>

								{/* ROW 2: Address + Contact + Experience + Bank */}
								<div className="mt-profile-grid-row mt-middle">
									{/* Column 1: Address */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Address</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Full Address</label>
											<p className="mt-field-value">{profile.address || "—"}</p>
										</div>
									</div>

									{/* Column 2: Contact Details */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Contact Details</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Phone Number</label>
											<p className="mt-field-value">{profile.phone || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Emergency Contact</label>
											<p className="mt-field-value">{profile.emergencyContactNumber || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Relationship</label>
											<p className="mt-field-value">{profile.relationship || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Email</label>
											<p className="mt-field-value">{profile.email || "—"}</p>
										</div>
									</div>

									{/* Column 3: Previous Experience */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Previous Experience</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Name Of the Company</label>
											<p className="mt-field-value">{experience.company || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Start &amp; Enddate</label>
											<p className="mt-field-value">
												{experience.startDate && experience.endDate ? `${experience.startDate}-${experience.endDate}` : "—"}
											</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Job Title</label>
											<p className="mt-field-value">{experience.role || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Job Description</label>
											<p className="mt-field-value mt-prev-exp-desc">{experience.description || "—"}</p>
										</div>
									</div>

									{/* Column 4: Bank Details */}
									<div className="mt-profile-section-col">
										<h5 className="mt-profile-section-title">Bank Details</h5>
										<div className="mt-field-group">
											<label className="mt-field-label">Bank Name</label>
											<p className="mt-field-value">{bank.name || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Branch</label>
											<p className="mt-field-value">{bank.branch || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">Account Number</label>
											<p className="mt-field-value">{bank.account || "—"}</p>
										</div>
										<div className="mt-field-group">
											<label className="mt-field-label">IFSC Code</label>
											<p className="mt-field-value">{bank.ifsc || "—"}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* --------- Add / Edit Employee Modal --------- */}
				{showModal && (
					<div className="modal-overlay1">
						<div className="add-employee-modal1">
							<div className="empl-modal-header-blue">
								<h3>{isEditing ? "Edit Employee" : "Add Employee"}</h3>
								<button
									className="empl-close-btn"
									onClick={() => setShowModal(false)}
								>
									×
								</button>
							</div>

							<div className="empl-modal-body">
								<form className="add-employee-form" onSubmit={handleSubmit}>
									<div className="empl-form-left">
										{/* ── Profile image upload ── */}
										<div className="profile-upload-section">
											<div className="profile-placeholder">
												{previewImage ? (
													<img
														src={previewImage}
														alt="Profile Preview"
														style={{
															width: "100%",
															height: "100%",
															borderRadius: "50%",
															objectFit: "cover",
														}}
													/>
												) : (
													<i className="profile-icon">
														<FaUserFriends size="2em" />
													</i>
												)}
											</div>

											<div className="upload-info">
												<h4>Upload Profile Image</h4>
												<p>Image should be below 4 MB</p>

												<input
													type="file"
													accept="image/*"
													style={{ display: "none" }}
													id="profileImageInput"
													onChange={handleImageChange}
												/>

												<button
													type="button"
													className="new-empl-upload-btn1"
													onClick={() =>
														document.getElementById("profileImageInput").click()
													}
												>
													Upload
												</button>
											</div>
										</div>

										{/* Form Rows */}
										<div className="form-row1">
											<div className="empl-form-group">
												<label>First Name</label>
												<input
													type="text"
													name="firstName"
													placeholder="Please enter name"
													value={formData.firstName}
													onChange={handleChange}
												/>
												{errors.firstName && (
													<p className="error-text">{errors.firstName}</p>
												)}
											</div>
											<div className="empl-form-group">
												<label>Last Name</label>
												<input
													type="text"
													name="lastName"
													placeholder="Please enter name"
													value={formData.lastName}
													onChange={handleChange}
												/>
												{errors.lastName && (
													<p className="error-text">{errors.lastName}</p>
												)}
											</div>
										</div>

										<div className="form-row1">
											<div className="empl-form-group">
												<label>Employee ID</label>
												<input
													type="text"
													name="employeeId"
													placeholder="Please enter employee ID"
													value={formData.employeeId}
													onChange={handleChange}
												/>
												{errors.employeeId && (
													<p className="error-text">{errors.employeeId}</p>
												)}
											</div>
											<div className="empl-form-group">
												<label>Joining Date</label>
												<input
													type="date"
													name="joiningDate"
													placeholder="dd/mm/yyyy"
													value={formData.joiningDate}
													onChange={handleChange}
												/>
												{errors.joiningDate && (
													<p className="error-text">{errors.joiningDate}</p>
												)}
											</div>
										</div>

										<div className="form-row1">
											<div className="empl-form-group">
												<label>Email</label>
												<input
													type="email"
													name="email"
													placeholder="Please enter email"
													value={formData.email}
													onChange={handleChange}
												/>
												{errors.email && (
													<p className="error-text">{errors.email}</p>
												)}
											</div>
											<div className="empl-form-group">
												<label>Phone Number</label>
												<input
													type="tel"
													name="phone"
													placeholder="Please enter phone number"
													value={formData.phone}
													onChange={handleChange}
												/>
												{errors.phone && (
													<p className="error-text">{errors.phone}</p>
												)}
											</div>
										</div>

										<div className="form-row1">
											<div className="empl-form-group">
												<label>Employment Type</label>
												<select
													name="employmentType"
													value={formData.employmentType}
													onChange={handleChange}
												>
													<option value="">Select</option>
													<option value="Full Time">Full Time</option>
													<option value="Part Time">Part Time</option>
													<option value="Contract">Contract</option>
													<option value="Intern">Intern</option>
												</select>
												{errors.employmentType && (
													<p className="error-text">{errors.employmentType}</p>
												)}
											</div>
											<div className="empl-form-group">
												<label>Primary Supervisor</label>
												<select
													name="supervisor"
													value={formData.supervisor}
													onChange={handleChange}
												>
													<option value="">Select</option>
													{staffList.map((staff) => (
														<option key={staff.id} value={staff.name}>
															{staff.name}
														</option>
													))}
												</select>
												{errors.supervisor && (
													<p className="error-text">{errors.supervisor}</p>
												)}
											</div>
										</div>

										<div className="form-row1">
											<div className="empl-form-group">
												<label>HR Manager</label>
												<select
													name="hrManager"
													value={formData.hrManager}
													onChange={handleChange}
												>
													<option value="">Select</option>
													{staffList
														.filter((staff) => staff.role === "admin")
														.map((staff) => (
															<option key={staff.id} value={staff.name}>
																{staff.name}
															</option>
														))}
												</select>
												{errors.hrManager && (
													<p className="error-text">{errors.hrManager}</p>
												)}
											</div>
											<div className="empl-form-group">
												<label>Department</label>
												<select
													name="department"
													value={formData.department}
													onChange={handleChange}
												>
													<option value="">Select</option>
													<option value="Engineering">Engineering</option>
													<option value="Marketing">Marketing</option>
													<option value="Sales">Sales</option>
													<option value="HR">HR</option>
													<option value="Finance">Finance</option>
												</select>
												{errors.department && (
													<p className="error-text">{errors.department}</p>
												)}
											</div>
										</div>

										<div className="form-row1">
											<div className="empl-form-group">
												<label>Designation</label>
												<select
													name="designation"
													value={formData.designation}
													onChange={handleChange}
												>
													<option value="">Select</option>
													<option value="Software Engineer">
														Software Engineer
													</option>
													<option value="Senior Engineer">
														Senior Engineer
													</option>
													<option value="Team Lead">Team Lead</option>
													<option value="Manager">Manager</option>
												</select>
												{errors.designation && (
													<p className="error-text">{errors.designation}</p>
												)}
											</div>
											<div className="empl-form-group">
												<label>Status</label>
												<select>
													<option>Active</option>
													<option>Inactive</option>
													<option>Pending</option>
												</select>
											</div>
										</div>

										{/* Modal Actions */}
										<div className="modal-actions01">
											<button type="submit" className="save-btn">
												{isEditing ? "Update" : "Save"}
											</button>
											<button
												type="button"
												className="action-cancel-btn"
												onClick={() => setShowModal(false)}
											>
												Cancel
											</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Employee;
