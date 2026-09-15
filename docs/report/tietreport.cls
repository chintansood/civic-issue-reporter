%% tietreport.cls
%% LaTeX document class for TIET university reports
%%
%% This class extends the standard 'report' class with
%% customizations for title page, headers, margins,
%% and chapter formatting specific to TIET requirements.

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{tietreport}[2026/09/03 TIET Report Class v1.0.4]

%% Forward all options to report class
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{report}}
\ProcessOptions\relax

%% Load base report class with standard options
\LoadClass[twoside,12pt,openright]{report}

%% ===================================================
%% Geometry: Page margins and asymmetric layout
%% ===================================================
\RequirePackage[
  inner=1.5in,
  outer=1in,
  top=1.8in,
  bottom=0.85in,
  headheight=15pt
]{geometry}

%% ===================================================
%% Fancyhdr: Alternating headers with page numbers
%% ===================================================
\RequirePackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE]{\thepage \quad \@tpHeader}
\fancyhead[RO]{\@tpTitle \quad \thepage}
\renewcommand{\headrulewidth}{0.5pt}
\renewcommand{\footrulewidth}{0pt}

%% ===================================================
%% Titlesec: Custom chapter title formatting
%% ===================================================
\RequirePackage{titlesec}
\titleformat{\chapter}[display]
  {\raggedleft\bfseries\large}
  {Chapter \thechapter}
  {0.3em}
  {\huge}
  [\vspace{0.1em}\hrule]
\titlespacing*{\chapter}{0pt}{-50pt}{40pt}
\assignpagestyle{\chapter}{empty}

%% ===================================================
%% Required packages: Hyperref, graphics, math
%% ===================================================
\RequirePackage{hyperref}
\RequirePackage{graphicx}
\RequirePackage{amsmath}
\RequirePackage{amssymb}

%% ===================================================
%% Internal Variables: Title page content storage
%% ===================================================

\newcommand{\@tpHeader}{%
  UCS503P Software Engineering Project Report%
}

\newcommand{\@tpTitle}{CivicScan: AI-Based Civic Problem Reporter}

\newcommand{\@tpSubTitle}{%
  Smart City Issue Detection, Severity Estimation \& Department Routing%
}

\newcommand{\@tpAuthors}{%
  \texttt{1024030806} Chintan Sood \\
  \texttt{1024030807} Tanu Bansal \\
  \texttt{1024030802} Adhyan Gupta%
}

\newcommand{\@tpSubText}{%
  Group: BE Third Year, CSE%
}

\newcommand{\@tpAdvisor}{%
  Dr. Nisha Thakur%
}

\newcommand{\@tpFooter}{%
  \large Mid-Semester Evaluation \\[0.2cm]
  \bfseries Computer Science and Engineering Department \\[0.15cm]
  Thapar Institute of Engineering and Technology, Patiala%
}

%% ===================================================
%% Public Commands: User-facing configuration
%% ===================================================

\newcommand{\TitlePageHeader}[1]{%
  \renewcommand{\@tpHeader}{#1}%
}

\newcommand{\ProjectTitle}[1]{%
  \renewcommand{\@tpTitle}{#1}%
}

\newcommand{\ProjectSubTitle}[1]{%
  \renewcommand{\@tpSubTitle}{#1}%
}

\renewcommand{\author}[1]{%
  \renewcommand{\@tpAuthors}{#1}%
}

\newcommand{\TitlePageSubText}[1]{%
  \renewcommand{\@tpSubText}{#1}%
}

\newcommand{\AdvisorName}[1]{%
  \renewcommand{\@tpAdvisor}{#1}%
}

\newcommand{\TitlePageFooterText}[1]{%
  \renewcommand{\@tpFooter}{#1}%
}

%% ===================================================
%% Maketitle: Render custom title page
%% ===================================================

\renewcommand{\maketitle}{%
  \begin{titlepage}
    \newgeometry{top=1in, bottom=1in, left=1.2in, right=1.2in}
    \thispagestyle{empty}
    \centering
    \vspace*{0.2cm}

    {\large \textbf{\@tpHeader}}

    \vspace{2.2cm}
    {\LARGE \textbf{\@tpTitle}\par}

    \vspace{0.4cm}
    {\large \@tpSubTitle\par}

    \vspace{2.8cm}
    {\large \textbf{Submitted by:}}

    \vspace{0.3cm}
    {\large \@tpAuthors}

    \vspace{0.5cm}
    {\normalsize \@tpSubText}

    \vfill

    {\large \textbf{Submitted to:}}

    \vspace{0.3cm}
    {\normalsize \@tpAdvisor}

    \vspace{1.8cm}
    {\normalsize \@tpFooter}
    \restoregeometry
  \end{titlepage}

  \newpage
  \thispagestyle{empty}%
}

\endinput
