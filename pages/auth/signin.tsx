// pages/auth/signin.tsx

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

// MUI Components
import Grid from "@mui/material/Grid2";
import { Box, TextField, Button } from "@mui/material";

// Styles
import styles from "@/styles/login/login.module.css";

const LoginPage = () => {
  // State for username, password, and error
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password.");
    } else {
      // Redirect to a protected page (e.g., /overview)
      window.location.href = "/overview";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container height="100%">
        {/* Left side (desktop only) */}
        <Grid
          size={{ xs: 6 }}
          padding="60px"
          display={{ xs: "none", md: "block" }}
          className={styles.left}
        >
          <Grid
            container
            alignItems="center"
            spacing={2}
            maxWidth="653px"
            margin="0 auto"
          >
            <Grid size={{ xs: "auto" }}>
              <Image
                src="/images/login/title-logo.png"
                width={80}
                height={80}
                alt="title-logo"
                style={{ display: "block" }}
              />
            </Grid>
            <Grid
              className={`${styles.titleText} notoFont`}
              size={{ xs: "auto" }}
            >
              <Grid
                marginBottom="3px"
                className={`${styles.titleText1} notoFont`}
              >
                กระทรวงสาธารณสุข
              </Grid>
              <Grid>MINISTRY OF PUBLIC HEALTH</Grid>
            </Grid>
          </Grid>
          <Grid
            className={styles.imageShowBox}
            padding="22px"
            borderRadius="16px"
            maxWidth="484px"
            margin="77px auto 0 auto"
          >
            <Image
              className={styles.imageShow}
              src="/images/login/image-show.png"
              width={484}
              height={344}
              alt="image-show"
              style={{ display: "block" }}
            />
          </Grid>
          <Grid marginTop="48px">
            <Grid className={`${styles.footText} notoFont`} textAlign="center">
              สรุปภาพรวมสุขภาพของคนไทย
            </Grid>
            <Grid
              maxWidth="545px"
              margin="40px auto 0 auto"
              className={`${styles.footSubText} notoFont`}
            >
              <Box marginBottom="32px" display="flex" alignItems="center" gap="16px">
                <em className="icon-check"></em>
                <span>กราฟสรุปผลเข้าใจง่าย</span>
              </Box>
              <Box marginBottom="32px" display="flex" alignItems="center" gap="16px">
                <em className="icon-check"></em>
                <span>รวบรวมผลการนับคาร์บจากผู้เข้าร่วมโครงการทั้งหมด</span>
              </Box>
              <Box display="flex" alignItems="center" gap="16px">
                <em className="icon-check"></em>
                <span>แผนที่ระบุความหนาแน่นของปัญหาสุขภาพ</span>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Right side (login form) */}
        <Grid
          container
          size={{ xs: 12, md: 6 }}
          alignItems="center"
          padding="60px"
          justifyContent="center"
        >
          <Grid maxWidth="559px" height="fit-content" width="100%">
            <Grid
              className={`${styles.welcomeText} notoFont`}
              marginBottom="17px"
              textAlign="center"
            >
              ยินดีต้อนรับ
            </Grid>
            <Grid className={`${styles.welcomeSubText} notoFont`} textAlign="center">
              โปรดทำการเข้าสู่ระบบ เพื่อใช้งาน NCD Dashboard
            </Grid>
            <Grid marginTop="40px">
              {/* Username Field */}
              <Grid>
                <label
                  className={`${styles.labelText} notoFont`}
                  htmlFor="username"
                >
                  Username
                </label>
                <TextField
                  className={`${styles.inputText} notoFont`}
                  fullWidth
                  id="username"
                  name="username"
                  size="small"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>

              {/* Password Field */}
              <Grid marginTop="32px">
                <label
                  className={`${styles.labelText} notoFont`}
                  htmlFor="password"
                >
                  รหัสผ่าน
                </label>
                <TextField
                  className={`${styles.inputText} notoFont`}
                  fullWidth
                  id="password"
                  name="password"
                  size="small"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              {/* Error Message */}
              {error && (
                <Box marginTop="16px" color="red" className="notoFont">
                  {error}
                </Box>
              )}
            </Grid>

            {/* Submit Button */}
            <Grid
              height="44px"
              marginTop="56px"
              borderRadius="8px"
              overflow="hidden"
            >
              <Button
                type="submit"
                sx={{ height: 44 }}
                className={`${styles.loginBtn} notoFont`}
                fullWidth
                variant="contained"
              >
                เข้าสู่ระบบ
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default LoginPage;
