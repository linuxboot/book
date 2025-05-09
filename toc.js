// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="intro.html"><strong aria-hidden="true">1.</strong> LinuxBoot Introduction</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="use-cases.html"><strong aria-hidden="true">1.1.</strong> Use cases</a></li><li class="chapter-item expanded "><a href="talks-news.html"><strong aria-hidden="true">1.2.</strong> Talks and news coverage</a></li></ol></li><li class="chapter-item expanded "><a href="components.html"><strong aria-hidden="true">2.</strong> LinuxBoot Components</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="tools-evaluation.html"><strong aria-hidden="true">2.1.</strong> Evaluation of tools</a></li></ol></li><li class="chapter-item expanded "><a href="openpower.html"><strong aria-hidden="true">3.</strong> OpenPOWER</a></li><li class="chapter-item expanded "><a href="u-root.html"><strong aria-hidden="true">4.</strong> All about u-root</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="u-root-qemu-demo.html"><strong aria-hidden="true">4.1.</strong> u-root demo with QEMU</a></li></ol></li><li class="chapter-item expanded "><a href="utilities/index.html"><strong aria-hidden="true">5.</strong> LinuxBoot utilities</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="utilities/UEFI_Tool_Kit.html"><strong aria-hidden="true">5.1.</strong> UEFI Tool Kit</a></li><li class="chapter-item expanded "><a href="utilities/cpu.html"><strong aria-hidden="true">5.2.</strong> The magical cpu command</a></li><li class="chapter-item expanded "><a href="utilities/dut.html"><strong aria-hidden="true">5.3.</strong> Device Under Test</a></li></ol></li><li class="chapter-item expanded "><a href="implementation.html"><strong aria-hidden="true">6.</strong> Implementing LinuxBoot</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="coreboot.u-root.systemboot/index.html"><strong aria-hidden="true">6.1.</strong> LinuxBoot using coreboot, u-root and systemboot</a></li></ol></li><li class="chapter-item expanded "><a href="glossary.html"><strong aria-hidden="true">7.</strong> Glossary</a></li><li class="chapter-item expanded "><a href="history.html"><strong aria-hidden="true">8.</strong> History</a></li><li class="chapter-item expanded "><a href="case_studies/index.html"><strong aria-hidden="true">9.</strong> Case Studies</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="case_studies/Ampere_study.html"><strong aria-hidden="true">9.1.</strong> Ampere study</a></li><li class="chapter-item expanded "><a href="case_studies/Google_study.html"><strong aria-hidden="true">9.2.</strong> Google study</a></li><li class="chapter-item expanded "><a href="case_studies/TiogaPass.html"><strong aria-hidden="true">9.3.</strong> OCP TiogaPass</a></li></ol></li><li class="chapter-item expanded "><a href="faq.html"><strong aria-hidden="true">10.</strong> Frequently Asked Questions</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
