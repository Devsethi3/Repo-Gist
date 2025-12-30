
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.6) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const repo = searchParams.get("repo") || "Repository";
    const owner = searchParams.get("owner") || "Owner";
    const score = parseInt(searchParams.get("score") || "0");
    const stars = searchParams.get("stars") || "0";
    const language = searchParams.get("language") || "Unknown";
    const description = searchParams.get("description") || "";

    const truncatedRepo = truncateText(repo, 30);
    const truncatedDescription = truncateText(description, 120);

    const getScoreConfig = (score: number) => {
      if (score >= 80)
        return { color: "#22c55e", bg: "#22c55e20", label: "Excellent" };
      if (score >= 60)
        return { color: "#eab308", bg: "#eab30820", label: "Good" };
      if (score >= 40)
        return { color: "#f97316", bg: "#f9731620", label: "Fair" };
      return { color: "#ef4444", bg: "#ef444420", label: "Needs Work" };
    };

    const scoreConfig = getScoreConfig(score);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#09090b",
            padding: "60px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Background gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 30% 20%, #3b82f620 0%, transparent 50%)",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "#0A0B0E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  height="18"
                  width="18"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="#FFE0C2">
                    <path
                      d="M4.25 2C2.73079 2 1.5 3.23079 1.5 4.75V6.5H16.5V6.25C16.5 4.73079 15.2692 3.5 13.75 3.5H8.72395L8.34569 3.02827C7.82347 2.37825 7.03552 2 6.201 2H4.25Z"
                      fill="#FFE0C2"
                    />
                    <path
                      d="M17.916 10.4048C17.7764 10.1353 17.499 9.9766 17.1846 10.0029C10.8301 10.5591 10.0127 17.0991 10.0049 17.165C9.95805 17.5766 10.2539 17.9482 10.6651 17.9951C10.6944 17.9985 10.7227 18 10.751 18C11.127 18 11.4512 17.7178 11.4951 17.335C11.4995 17.2963 11.5237 17.1037 11.5877 16.8113C11.675 16.3891 12.0312 15.0156 12.8281 14.1094C12.8281 14.1094 12.5 15.3906 12.7034 16.5H13.5C16.5498 16.5 16.9189 14.5146 17.1885 13.0649C17.3213 12.352 17.4463 11.6792 17.8223 11.2343C18.0186 11.0024 18.0556 10.6748 17.916 10.4048Z"
                      fill="#FFE0C2"
                    />
                    <path
                      d="M16.5 6.5H1.5V13.25C1.5 14.7692 2.73079 16 4.25 16H8.71013C8.90018 15.2425 9.2603 14.1408 9.91929 13.0117C11.04 11.0916 13.0604 9.05376 16.5 8.57149V6.5Z"
                      fill="#7B6E60"
                      fillOpacity="0.4"
                    />
                  </g>
                </svg>
              </div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                RepoGist
              </span>
            </div>

            {/* Score badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px 24px",
                borderRadius: "16px",
                backgroundColor: scoreConfig.bg,
                border: `2px solid ${scoreConfig.color}40`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#a1a1aa",
                    marginBottom: "4px",
                  }}
                >
                  Analysis Score
                </span>
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    color: scoreConfig.color,
                    lineHeight: 1,
                  }}
                >
                  {score}
                </span>
              </div>
              <div
                style={{
                  width: "2px",
                  height: "60px",
                  backgroundColor: scoreConfig.color + "40",
                }}
              />
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: scoreConfig.color,
                }}
              >
                {scoreConfig.label}
              </span>
            </div>
          </div>

          {/* Repository info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#a1a1aa">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span
                style={{
                  fontSize: "20px",
                  color: "#a1a1aa",
                }}
              >
                {owner}
              </span>
            </div>

            <h1
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "16px",
                lineHeight: 1.1,
              }}
            >
              {truncatedRepo}
            </h1>

            {truncatedDescription && (
              <p
                style={{
                  fontSize: "24px",
                  color: "#71717a",
                  marginBottom: "32px",
                  lineHeight: 1.4,
                  maxWidth: "80%",
                }}
              >
                {truncatedDescription}
              </p>
            )}

            {/* Stats */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#27272a",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#eab308">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  {stars}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#27272a",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                  }}
                />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  {language}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid #27272a",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                color: "#71717a",
              }}
            >
              Analyzed by RepoGist
            </span>
            <span
              style={{
                fontSize: "16px",
                color: "#71717a",
              }}
            >
              repo-gist.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
